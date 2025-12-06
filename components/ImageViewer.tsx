
import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset zoom on open
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(1, prev + delta), 4));
  };

  const onWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    handleZoom(e.deltaY * -0.005);
  };

  // Mouse Drag Events
  const onMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const onMouseUp = () => setIsDragging(false);

  // Touch Events for Mobile
  const lastTouchDistance = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
        setIsDragging(true);
        dragStart.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
    } else if (e.touches.length === 2) {
        // Pinch start
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        lastTouchDistance.current = dist;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
        setPosition({
            x: e.touches[0].clientX - dragStart.current.x,
            y: e.touches[0].clientY - dragStart.current.y
        });
    } else if (e.touches.length === 2 && lastTouchDistance.current !== null) {
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = dist - lastTouchDistance.current;
        handleZoom(delta * 0.01);
        lastTouchDistance.current = dist;
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistance.current = null;
  };

  return (
    <div 
        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center overflow-hidden animate-fade-in"
        onWheel={onWheel}
    >
      {/* Controls */}
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-50">
        <X size={24} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
         <button onClick={() => handleZoom(-0.5)} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 disabled:opacity-30" disabled={scale<=1}>
            <ZoomOut size={20} />
         </button>
         <div className="px-4 py-3 bg-white/10 rounded-full text-white text-xs font-mono">
            {Math.round(scale * 100)}%
         </div>
         <button onClick={() => handleZoom(0.5)} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 disabled:opacity-30" disabled={scale>=4}>
            <ZoomIn size={20} />
         </button>
      </div>

      {/* Image Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img 
            ref={imgRef}
            src={src} 
            alt="Full View"
            draggable={false}
            className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out cursor-grab active:cursor-grabbing"
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                cursor: scale > 1 ? 'move' : 'default'
            }}
        />
      </div>
    </div>
  );
};

export default ImageViewer;
