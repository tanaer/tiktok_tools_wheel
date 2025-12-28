import React, { useRef } from 'react';
import { useWheelCanvas } from '@/hooks/useWheelCanvas';
import { useConfig } from '@/context/ConfigContext';
import { getThemeColors } from '@/utils/colors';

interface WheelProps {
  rotation: number;
  isSpinning?: boolean;
}

const Pointer = ({ position, theme, color }: { position: string; theme: string; color: string }) => {
  const getPositionStyle = () => {
    // Determine offset based on theme to ensure pointer touches wheel boundary
    // Wheel Radius = 246px (from center)
    // Wheel Top Edge = 300 - 246 = 54px (from top of container)
    // Offset calculation based on Pointer Height and Rotation:
    
    let offset = '10px'; // Default for Standard Pointer (Triangle)
    
    if (theme === 'festive') {
      // Lantern: Height 80px. Tip at y=78 approx.
      offset = '-19px';
    } else if (theme === 'christmas') {
      // Santa: Height 70px. Tip at y=65.
      offset = '-6px';
    } else {
      // Standard (Cyberpunk/Flat): Height 50px.
      offset = '10px';
    }
    
    const isNativeDown = theme === 'festive' || theme === 'christmas';
    
    // We combine Tailwind classes with inline styles for dynamic offsets
    // IMPORTANT: We handle rotation here in the transform to ensure it merges with translation properly
    switch (position) {
      case 'top':
        // Standard: Pointing UP. Need Rotate 180 to point DOWN.
        // Native: Pointing DOWN. No Rotate.
        return { 
          top: offset, 
          left: '50%', 
          transform: isNativeDown ? 'translateX(-50%)' : 'translateX(-50%) rotate(180deg)' 
        };
      case 'right':
        // Standard: Pointing UP. Need Rotate -90 to point LEFT.
        // Native: Pointing DOWN. Need Rotate 90 to point LEFT.
        return { 
          right: offset, 
          top: '50%', 
          transform: isNativeDown 
            ? 'translateY(-50%) rotate(90deg)' 
            : 'translateY(-50%) rotate(-90deg)' 
        };
      case 'bottom':
        // Standard: Pointing UP. No Rotate.
        // Native: Pointing DOWN. Need Rotate 180 to point UP.
        return { 
          bottom: offset, 
          left: '50%', 
          transform: isNativeDown 
            ? 'translateX(-50%) rotate(180deg)' 
            : 'translateX(-50%)' 
        };
      case 'left':
        // Standard: Pointing UP. Need Rotate 90 to point RIGHT.
        // Native: Pointing DOWN. Need Rotate -90 to point RIGHT.
        return { 
          left: offset, 
          top: '50%', 
          transform: isNativeDown 
            ? 'translateY(-50%) rotate(-90deg)' 
            : 'translateY(-50%) rotate(90deg)' 
        };
      default:
        return { top: offset, left: '50%', transform: 'translateX(-50%)' };
    }
  };

  const renderContent = () => {
    if (theme === 'festive') {
      // Red Lantern
      return (
        <svg width="60" height="80" viewBox="0 0 60 80" fill="none" className="drop-shadow-lg">
          {/* Tassel */}
          <path d="M30 60L25 75H35L30 60Z" fill="#FFD700" />
          {/* Main Body */}
          <path d="M15 15 C 5 25, 5 50, 15 60 H 45 C 55 50, 55 25, 45 15 Z" fill="#D32F2F" stroke="#FFD700" strokeWidth="2"/>
          {/* Top Cap */}
          <rect x="20" y="10" width="20" height="5" fill="#333" />
          <rect x="28" y="0" width="4" height="10" fill="#FFD700" />
          {/* Bottom Cap */}
          <rect x="20" y="60" width="20" height="5" fill="#333" />
          {/* Pointer Tip */}
          <path d="M30 65L25 78H35L30 65Z" fill="#FFD700" />
        </svg>
      );
    }
    if (theme === 'christmas') {
      // Santa Hat + Face
      return (
        <svg width="60" height="70" viewBox="0 0 60 70" fill="none" className="drop-shadow-lg">
           {/* Hat Red Part */}
           <path d="M10 30 C 10 30, 25 5, 50 35 L 10 35 Z" fill="#D32F2F" />
           {/* Hat White Trim */}
           <rect x="5" y="30" width="50" height="10" rx="5" fill="white" />
           {/* Hat Ball */}
           <circle cx="50" cy="35" r="5" fill="white" />
           {/* Face */}
           <path d="M15 40 Q 30 60 45 40" fill="#FFCCBC" />
           {/* Beard/Pointer */}
           <path d="M10 40 Q 30 70 50 40 L 30 65 Z" fill="white" />
           {/* Nose */}
           <circle cx="30" cy="45" r="3" fill="#FFAB91" />
        </svg>
      );
    }
    // Default Pointer
    return (
      <svg width="50" height="50" viewBox="0 0 24 24" fill={color} className="drop-shadow-lg">
        <path d="M12 2L22 12H2L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div 
      className="absolute z-30 transition-all duration-300 pointer-events-none"
      style={getPositionStyle()}
    >
      {renderContent()}
    </div>
  );
};

export const Wheel: React.FC<WheelProps> = ({ rotation, isSpinning = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeProfile } = useConfig();
  const colors = getThemeColors(activeProfile.theme);
  const isTransparentHidden = activeProfile.hiddenMode && activeProfile.transparentHide;

  useWheelCanvas({ canvasRef, rotation });

  const lightCount = 24;
  
  // Calculate visible range for lights if in transparent mode
  const pointerPos = activeProfile.pointerPosition || 'top';
  const pointerAngleMap: Record<string, number> = {
    right: 0,
    bottom: 90,
    left: 180,
    top: 270,
  };
  const centerAngle = pointerAngleMap[pointerPos] ?? 270; // Fallback to 270 (top) if undefined
  const visiblePercent = activeProfile.visiblePercentage || 20;
  // Convert percentage to degrees (e.g., 20% -> 72 deg)
  const visibleRangeDeg = (visiblePercent / 100) * 360; 
  
  // Calculate start angle for conic gradient mask
  // Ensure result is positive [0, 360]
  let maskStartAngle = (centerAngle - visibleRangeDeg/2 + 90) % 360;
  if (maskStartAngle < 0) maskStartAngle += 360;

  const lights = Array.from({ length: lightCount }).map((_, i) => {
    const angle = (i / lightCount) * 360;
    
    // Check if light is in visible range
    if (isTransparentHidden) {
      // Normalize difference to [0, 180]
      let diff = Math.abs(angle - centerAngle);
      if (diff > 180) diff = 360 - diff;
      
      // If outside visible range, don't render. 
      // Add a tiny buffer for lights (half a light width ~ 2 degrees) to avoid cutting off lights exactly on edge
      if (diff > (visibleRangeDeg / 2) + 2) return null;
    }

    // Lights on the ring border (Center of border at 273px: 560/2 - 14/2)
    const r = 273; 
    const x = Math.cos((angle * Math.PI) / 180) * r;
    const y = Math.sin((angle * Math.PI) / 180) * r;

    // Odd/Even blinking logic (Marquee)
    const isEven = i % 2 === 0;
    const duration = isSpinning ? '0.2s' : '1.5s'; // Slower when idle
    
    // We use a CSS animation that toggles opacity/color
    const delay = isEven ? '0s' : `calc(${duration} / 2)`;

    return (
      <div
        key={i}
        className="absolute z-20"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: 14, 
            height: 14,
            // Base state: Black/Off (2D dot, no border)
            backgroundColor: '#000', 
            opacity: 0.8,
            // Animation toggles to "On" state
            // Combine all properties into shorthand to avoid React conflicts
            animation: `marquee-blink ${duration} steps(1) infinite ${delay}`,
          }}
        />
      </div>
    );
  });

  const ring = (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: 560, // Smaller ring
        height: 560,
        border: `14px solid ${colors.ringColor}`, 
        boxShadow: activeProfile.theme === 'flat' || activeProfile.theme === 'warm_gradient'
          ? '0 0 0 1px rgba(0,0,0,0.05)' 
          : `0 0 40px ${colors.bulbGlowColor}33, inset 0 0 20px ${colors.ringColor}`,
        // In transparent hide mode, apply a mask to only show the visible segment
        maskImage: isTransparentHidden 
          ? `conic-gradient(from ${maskStartAngle}deg, transparent 0deg, black 0deg, black ${visibleRangeDeg}deg, transparent ${visibleRangeDeg}deg)`
          : 'none',
        WebkitMaskImage: isTransparentHidden
          ? `conic-gradient(from ${maskStartAngle}deg, transparent 0deg, black 0deg, black ${visibleRangeDeg}deg, transparent ${visibleRangeDeg}deg)`
          : 'none'
      }}
    />
  );

  return (
    <div className="relative w-[600px] h-[600px] flex items-center justify-center">
      {/* Inject Keyframes for marquee-blink */}
      <style>{`
        @keyframes marquee-blink {
          0%, 49% {
            background-color: #111;
            box-shadow: none;
            opacity: 0.5;
          }
          50%, 100% {
            background-color: ${colors.bulbColor};
            box-shadow: 0 0 15px ${colors.bulbGlowColor};
            opacity: 1;
          }
        }
      `}</style>

      {/* Always render ring and lights, regardless of hidden mode, BUT apply z-index carefully */}
      {/* If hiddenMode is true, we want these on TOP of the canvas (which has the mask) */}
      {/* Only render lights if NOT in transparent hide mode OR if we specifically allowed them above */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {lights}
      </div>
      
      {/* Ring is always rendered now, but masked if hidden */}
      <div className="absolute inset-0 z-20 pointer-events-none">{ring}</div>

      {/* Canvas is z-10 */}
      <canvas ref={canvasRef} className="w-full h-full relative z-10" />

      {/* Center Logo Text - Always Show */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center justify-center"
        style={{ width: 80, height: 80, overflow: 'hidden' }} // Ensure overflow hidden
      >
         <span 
           className="text-[10px] font-bold tracking-widest uppercase text-center leading-tight break-words w-full"
           style={{ 
             color: activeProfile.theme === 'festive' ? '#FFD700' : 
                    activeProfile.theme === 'cyberpunk' ? '#00f3ff' : 
                    activeProfile.theme === 'christmas' ? '#FFFFFF' : 
                    activeProfile.theme === 'flat' ? '#2D336B' : 
                    activeProfile.theme === 'warm_gradient' ? '#2D336B' : '#ffffff',
             textShadow: activeProfile.theme === 'flat' || activeProfile.theme === 'warm_gradient' ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
             display: '-webkit-box',
             WebkitLineClamp: 3,
             WebkitBoxOrient: 'vertical',
             whiteSpace: 'normal',
             wordBreak: 'break-word',
           }}
         >
           {activeProfile.logoText || 'BLOOMING'}
         </span>
      </div>

      {/* Pointer - Always Show */}
      <Pointer position={activeProfile.pointerPosition || 'top'} theme={activeProfile.theme} color={colors.pointerColor} />
    </div>
  );
};
