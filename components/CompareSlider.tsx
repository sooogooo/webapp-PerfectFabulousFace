
import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface CompareSliderProps {
  leftImage: string; // Before (Original)
  rightImage: string; // After (Generated)
  leftLabel?: string;
  rightLabel?: string;
}

const CompareSlider: React.FC<CompareSliderProps> = ({ leftImage, rightImage, leftLabel, rightLabel }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  };

  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[300px] overflow-hidden select-none cursor-col-resize group bg-gray-100 rounded-lg"
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onTouchMove={onTouchMove}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* Right Image (Background / After) - Always fully visible */}
      <img 
        src={rightImage} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" 
      />
      
      {/* Left Image (Foreground / Before) - Clipped using inset */}
      <img 
        src={leftImage} 
        alt="Before" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      />
      
      {/* Labels */}
      {rightLabel && (
        <span className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10 pointer-events-none">
          {rightLabel}
        </span>
      )}
      {leftLabel && (
        <span 
            className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10 pointer-events-none"
            style={{ opacity: sliderPosition > 10 ? 1 : 0 }} 
        >
          {leftLabel}
        </span>
      )}

      {/* Slider Handle Line */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white cursor-col-resize shadow-[0_0_10px_rgba(0,0,0,0.3)] z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur rounded-full shadow-md flex items-center justify-center text-primary border border-gray-200">
          <ChevronsLeftRight size={16} />
        </div>
      </div>
    </div>
  );
};

export default CompareSlider;
