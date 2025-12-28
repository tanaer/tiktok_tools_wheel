import { useEffect } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { getThemeColors } from '@/utils/colors';

interface UseWheelCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  rotation: number;
}

export const useWheelCanvas = ({ canvasRef, rotation }: UseWheelCanvasProps) => {
  const { activeProfile } = useConfig();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas dimensions
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale context
    ctx.scale(dpr, dpr);
    
    // Calculate center and radius
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) * 0.82; // Reduced from 0.9 to create space for lights

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const colors = getThemeColors(activeProfile.theme);
    const items = activeProfile.items;
    const totalProb = items.reduce((sum, item) => sum + item.probability, 0);
    const TWO_PI = Math.PI * 2;
    const MIN_DEG = 6;
    const MIN_RAD = (MIN_DEG * Math.PI) / 180;
    const rawAngles = items.map((item) => (item.probability / totalProb) * TWO_PI);
    const smallIdx: number[] = [];
    const largeIdx: number[] = [];
    rawAngles.forEach((a, i) => (a < MIN_RAD ? smallIdx.push(i) : largeIdx.push(i)));
    const sumSmallMin = smallIdx.length * MIN_RAD;
    let angles: number[] = new Array(items.length).fill(0);
    if (sumSmallMin >= TWO_PI) {
      const equal = TWO_PI / items.length;
      angles = angles.map(() => equal);
    } else {
      const sumLargeRaw = largeIdx.reduce((s, i) => s + rawAngles[i], 0);
      const remaining = TWO_PI - sumSmallMin;
      smallIdx.forEach((i) => (angles[i] = MIN_RAD));
      largeIdx.forEach((i) => (angles[i] = (rawAngles[i] / sumLargeRaw) * remaining));
    }
    
    // Define drawing function for reuse
    const drawWheel = (context: CanvasRenderingContext2D) => {
      let currentAngle = rotation * (Math.PI / 180); // Convert rotation to radians

      // Draw Wheel Background/Shadow
      context.save();
      context.beginPath();
      context.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
      context.fillStyle = colors.wheelBorder;
      context.shadowColor = colors.shadowColor;
      context.shadowBlur = 20;
      context.fill();
      context.restore();

      // Draw Sectors
      items.forEach((item, index) => {
        const sectorAngle = angles[index];
        
        context.save();
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.arc(centerX, centerY, radius, currentAngle, currentAngle + sectorAngle);
        context.closePath();
        
        // Use custom color or theme color cycle
        const sectorColor = item.color || colors.sectorColors[index % colors.sectorColors.length];
        context.fillStyle = sectorColor;
        context.fill();
        context.stroke();

        // Draw Text
        context.translate(centerX, centerY);
        context.rotate(currentAngle + sectorAngle / 2);
        context.textAlign = 'right';
        context.textBaseline = 'middle'; // Center text vertically in the sector

        // Alternate text color based on sector index if it's an array, otherwise fallback
        context.fillStyle = Array.isArray(colors.textColor) 
          ? colors.textColor[index % colors.textColor.length] 
          : colors.textColor;
        
        const baseFontSize = Math.min(32, Math.max(18, 240 / items.length));
        const lengthScale = Math.min(1, 12 / Math.max(1, item.text.length));
        let fontSize = Math.max(12, baseFontSize * lengthScale);
        const maxWidth = radius * 0.6;
        let text = item.text;

        while (true) {
          context.font = `bold ${fontSize}px "Microsoft YaHei", "Inter", sans-serif`;
          const width = context.measureText(text).width;
          if (width <= maxWidth || fontSize <= 10) break;
          fontSize -= 1;
        }

        let width = context.measureText(text).width;
        if (width > maxWidth) {
          let trimmed = text;
          while (trimmed.length > 1 && context.measureText(trimmed + '…').width > maxWidth) {
            trimmed = trimmed.slice(0, -1);
          }
          text = trimmed + '…';
          width = context.measureText(text).width;
        }

        context.fillText(text, radius - 35, 0);
        
        context.restore();

        currentAngle += sectorAngle;
      });
    };

    const pointerPos = activeProfile.pointerPosition || 'top';
    const pointerAngleMap = {
      right: 0,
      bottom: 90,
      left: 180,
      top: 270,
    };
    const pointerAngleDeg = pointerAngleMap[pointerPos];
    const pointerAngleRad = (pointerAngleDeg * Math.PI) / 180;

    if (!activeProfile.hiddenMode) {
      drawWheel(ctx);
    } else {
      const visiblePercent = activeProfile.visiblePercentage || 20;
      const visibleAngleRad = (visiblePercent / 100) * (Math.PI * 2);

      if (activeProfile.transparentHide) {
        // Transparent Hide: Clip to wedge, draw wheel, nothing else
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius + 22, pointerAngleRad - visibleAngleRad/2, pointerAngleRad + visibleAngleRad/2);
        ctx.closePath();
        ctx.clip();
        
        drawWheel(ctx);
        ctx.restore();
      } else {
        // Normal Hide: Draw full wheel first
        drawWheel(ctx);

        // 1. Define Styles based on theme
        let gradStart = '#111', gradEnd = '#000', borderColor = colors.wheelBorder, shadowColor = 'rgba(0,0,0,0.5)';
        
        switch (activeProfile.theme) {
          case 'cyberpunk':
            gradStart = '#1a1b4b'; gradEnd = '#050b14';
            borderColor = '#00f3ff';
            shadowColor = '#00f3ff'; // Glowy shadow
            break;
          case 'festive':
            gradStart = '#b71c1c'; gradEnd = '#5e0000';
            borderColor = '#FFD700';
            shadowColor = 'rgba(0,0,0,0.5)';
            break;
          case 'christmas':
            gradStart = '#2e7d32'; gradEnd = '#0a2f1c';
            borderColor = '#c41e3a';
            shadowColor = 'rgba(0,0,0,0.5)';
            break;
          case 'flat':
            gradStart = '#ffffff'; gradEnd = '#f1f2f6';
            borderColor = '#dfe4ea';
            shadowColor = 'rgba(0,0,0,0.1)';
            break;
          case 'warm_gradient':
            gradStart = '#FFF2F2'; gradEnd = '#E0E7FF'; // Light pink to light blue
            borderColor = '#2D336B';
            shadowColor = 'rgba(45, 51, 107, 0.2)';
            break;
        }

        ctx.save();
        ctx.beginPath();
        // Move to center
        ctx.moveTo(centerX, centerY);
        // Draw arc starting from end of visible region, going ALL THE WAY AROUND to start of visible region
        // visible region is: [pointer - vis/2, pointer + vis/2]
        // So we draw from (pointer + vis/2) to (pointer - vis/2)
        // The mask should only cover the wheel (radius + padding), not the whole canvas
        ctx.arc(centerX, centerY, radius + 25, pointerAngleRad + visibleAngleRad/2, pointerAngleRad - visibleAngleRad/2, false);
        ctx.closePath();
        
        // Gradient Fill
        const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, radius);
        gradient.addColorStop(0, gradStart);
        gradient.addColorStop(1, gradEnd);
        ctx.fillStyle = gradient;

        // Shadow (Depth effect)
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 20;
        ctx.fill();

        // Stroke (Border)
        ctx.shadowBlur = 0; 
        ctx.lineWidth = 3;
        ctx.strokeStyle = borderColor;
        ctx.stroke();

        ctx.restore();
      }

      // Draw Border for the wedge (in both cases)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius + 22, pointerAngleRad - visibleAngleRad/2, pointerAngleRad + visibleAngleRad/2);
      ctx.closePath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = colors.wheelBorder;
      ctx.stroke();
      ctx.restore();
    }

    // Draw Center Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, Math.PI * 2); // Increased from 30 to 45 (Dia 90) to fit 80px text
    ctx.fillStyle = colors.wheelBg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = colors.wheelBorder;
    ctx.stroke();

  }, [activeProfile, rotation]);
};
