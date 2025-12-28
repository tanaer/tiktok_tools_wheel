import { useState, useRef, useCallback, useEffect } from 'react';
import { useConfig } from '@/context/ConfigContext';
import confetti from 'canvas-confetti';
import useSound from 'use-sound';
import { WheelItem } from '@/types';

// Placeholder base64 short sounds
const tickSound = 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'; 
const winSound = 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

// Custom easing to simulate Accel -> Cruise -> Decel
// We want a short accel, long cruise, long decel?
// Actually standard easeOut is usually fine for wheels if we start with high speed.
// But let's try a custom curve:
// 0-0.1: Accel
// 0.1-0.6: Cruise (linear-ish)
// 0.6-1.0: Decel
// For simplicity and smoothness, easeOutQuart is often best for wheels as it spends most time slowing down.
const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

export const useWheelLogic = () => {
  const { config, activeProfile } = useConfig();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [lastWinnerId, setLastWinnerId] = useState<string | null>(null);
  
  const rotationRef = useRef(0);
  const reqIdRef = useRef<number>(0);
  const lastTickRef = useRef(0);
  const startTimeRef = useRef(0);
  const startRotationRef = useRef(0);
  const targetRotationRef = useRef(0);

  const [playTick] = useSound(tickSound, { volume: 0.5, soundEnabled: config.soundEnabled });
  const [playWin] = useSound(winSound, { volume: 0.8, soundEnabled: config.soundEnabled });

  const totalProb = activeProfile.items.reduce((sum, item) => sum + item.probability, 0);

  // Helper to pick a random item based on weights
  const pickRandomItem = (excludeId?: string | null): WheelItem => {
    let items = activeProfile.items;
    
    // If excludeId is provided, filter it out temporarily for selection
    // But we must respect probabilities.
    // If we filter it out, we should re-normalize probabilities or just reroll.
    // Rerolling is safer to maintain relative weights of others.
    
    let selected = items[0];
    let attempts = 0;
    
    do {
      const rand = Math.random() * totalProb;
      let sum = 0;
      for (const item of items) {
        sum += item.probability;
        if (rand < sum) {
          selected = item;
          break;
        }
      }
      attempts++;
    } while (excludeId && selected.id === excludeId && attempts < 10);
    
    return selected;
  };

  const getTargetAngleForItem = (targetItem: WheelItem) => {
    // 1. Find item's index and probability range
    let currentProb = 0;
    let startRatio = 0;
    let endRatio = 0;
    
    for (const item of activeProfile.items) {
      if (item.id === targetItem.id) {
        startRatio = currentProb / totalProb;
        endRatio = (currentProb + item.probability) / totalProb;
        break;
      }
      currentProb += item.probability;
    }

    // 2. Angles on the wheel (0-360)
    // The wheel draws items clockwise from 0? Or counter-clockwise?
    // Usually standard: 0 is right, goes clockwise.
    // Let's assume standard math: 0 to 360 covers the circle.
    // Item is from angle (startRatio * 360) to (endRatio * 360).
    const startAngle = startRatio * 360;
    const endAngle = endRatio * 360;
    const sectorSize = endAngle - startAngle;

    // 3. Add random jitter within sector (10% padding on each side)
    const padding = sectorSize * 0.1;
    const randomOffset = padding + Math.random() * (sectorSize - 2 * padding);
    const targetAngleOnWheel = (startAngle + randomOffset) % 360;

    // 4. Adjust for Pointer Position
    // We want this angle to end up UNDER the pointer.
    // Pointer is at `pointerOffset`.
    // Rotation required: `finalRotation % 360` such that `(pointerOffset - finalRotation) % 360 = targetAngleOnWheel`
    // => `pointerOffset - finalRotation = targetAngleOnWheel`
    // => `finalRotation = pointerOffset - targetAngleOnWheel`
    
    const pointerPos = activeProfile.pointerPosition || 'top';
    const pointerOffsetMap = {
      right: 0,
      bottom: 90,
      left: 180,
      top: 270,
    };
    const pointerOffset = pointerOffsetMap[pointerPos];

    let targetRotation = pointerOffset - targetAngleOnWheel;
    
    // Normalize to positive
    while (targetRotation < 0) targetRotation += 360;
    
    return targetRotation;
  };

  const spin = useCallback((options?: { 
    targetId?: string; 
    targetType?: string; 
    excludeLast?: boolean; 
    targetLast?: boolean;
  }) => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setWinner(null);
    
    // 1. Determine Target Item
    let targetItem: WheelItem;

    if (options?.targetId) {
      targetItem = activeProfile.items.find(i => i.id === options.targetId) || activeProfile.items[0];
    } else if (options?.targetType) {
      const typeItems = activeProfile.items.filter(i => i.type === options.targetType);
      if (typeItems.length > 0) {
        // Pick random from this type (equal weight? or probability weight?)
        // Let's just pick random for simplicity or use their relative weights.
        // Simple random for now since type filtering is specific.
        targetItem = typeItems[Math.floor(Math.random() * typeItems.length)];
      } else {
        targetItem = pickRandomItem(null);
      }
    } else if (options?.excludeLast && lastWinnerId) {
      targetItem = pickRandomItem(lastWinnerId);
    } else if (options?.targetLast && lastWinnerId) {
      targetItem = activeProfile.items.find(i => i.id === lastWinnerId) || activeProfile.items[0];
    } else {
      targetItem = pickRandomItem(null);
    }

    // 2. Calculate Target Rotation
    const targetBaseRotation = getTargetAngleForItem(targetItem);
    
    // 3. Add spins
    const currentRot = rotationRef.current;
    const minSpins = 5; // Minimum full rotations
    const extraSpins = 3; // Random extra
    // We want to reach targetBaseRotation but strictly increasing
    // Find next multiple of 360 + targetBaseRotation that is > currentRot + minSpins * 360
    const minTarget = currentRot + (minSpins * 360);
    const modDiff = (targetBaseRotation - (minTarget % 360) + 360) % 360;
    
    targetRotationRef.current = minTarget + modDiff + (Math.floor(Math.random() * extraSpins) * 360);
    startRotationRef.current = currentRot;
    startTimeRef.current = performance.now();

    const durationSec = activeProfile.spinDurationSec || 8;
    const durationMs = durationSec * 1000;

    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // Easing
      const ease = easeOutQuart(progress);
      
      const newRotation = startRotationRef.current + (targetRotationRef.current - startRotationRef.current) * ease;
      
      rotationRef.current = newRotation;
      setRotation(newRotation);

      // Sound trigger
      if (Math.abs(rotationRef.current - lastTickRef.current) > (360 / (activeProfile.items.length * 2))) {
         playTick();
         lastTickRef.current = rotationRef.current;
      }

      if (progress < 1) {
        reqIdRef.current = requestAnimationFrame(animate);
      } else {
        // Finish
        setIsSpinning(false);
        setWinner(targetItem);
        setLastWinnerId(targetItem.id);
        
        if (config.soundEnabled) playWin();
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        });
      }
    };

    reqIdRef.current = requestAnimationFrame(animate);
  }, [isSpinning, activeProfile, lastWinnerId, playTick, playWin, config.soundEnabled, totalProb]);

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(reqIdRef.current);
  }, []);

  return { rotation, isSpinning, spin, winner, setWinner };
};
