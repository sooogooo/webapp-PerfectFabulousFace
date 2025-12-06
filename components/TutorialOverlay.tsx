
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialStep {
  targetId?: string; // ID of the element to highlight (optional, if null, centers modal)
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS: TutorialStep[] = [
  {
    title: "欢迎来到丽丽格格",
    content: "这里是您的专属AI美学顾问。只需几步，即可解锁您的千面之美。",
    position: 'center'
  },
  {
    targetId: 'upload-section', // Need to add this ID to ImageUploader container
    title: "第一步：上传照片",
    content: "点击这里上传一张清晰的正面人像照片，或者直接拍摄。这是分析的基础。",
    position: 'bottom'
  },
  {
    targetId: 'preset-section', // Need to add this ID to Presets container
    title: "智能场景与预设",
    content: "不知道怎么调？点击这些快捷卡片，一键生成“职场大女主”或“在逃公主”风格。",
    position: 'bottom'
  },
  {
    targetId: 'control-panel', // Need to add this ID to ControlPanel container
    title: "专业美学控制台",
    content: "在这里，您可以像专业修图师一样，微调美颜程度、选择古典或现代风格，甚至定制发型和穿搭。",
    position: 'top'
  },
  {
    title: "开始体验吧！",
    content: "一切就绪，现在就开始您的美学探索之旅吧。",
    position: 'center'
  }
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isOpen) return;
    
    // Calculate position based on target element
    const step = STEPS[currentStep];
    if (step.targetId) {
      const element = document.getElementById(step.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const style: React.CSSProperties = { position: 'absolute' };
        
        // Simple positioning logic (can be refined)
        if (step.position === 'bottom') {
          style.top = rect.bottom + window.scrollY + 10;
          style.left = rect.left + window.scrollX + (rect.width / 2) - 150; // Center horizontally (assuming width 300)
        } else if (step.position === 'top') {
          style.bottom = (window.innerHeight - rect.top) + 10;
           style.left = rect.left + window.scrollX + (rect.width / 2) - 150;
        }
        
        // Ensure strictly within viewport
        // (Simplified for brevity, real implementation needs edge detection)
        
        setPositionStyle(style);
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
         // Fallback to center if element not found
         setPositionStyle({
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
         });
      }
    } else {
       setPositionStyle({
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
       });
    }

  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px] transition-opacity duration-300">
      {/* Spotlight Effect (Optional/Advanced: requires SVG masking or complex CSS) */}
      
      {/* Tutorial Card */}
      <div 
        className="bg-surface p-6 rounded-2xl shadow-2xl w-[90%] max-w-sm border border-white/20 animate-fade-in z-[101]"
        style={step.targetId ? { ...positionStyle, width: '300px' } : positionStyle}
      >
        <div className="flex justify-between items-start mb-4">
           <div className="flex items-center gap-2">
             <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
               {currentStep + 1}/{STEPS.length}
             </span>
             <h3 className="text-lg font-serif font-bold text-primary">{step.title}</h3>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-primary"><X size={18}/></button>
        </div>
        
        <p className="text-sm text-gray-600 font-light leading-relaxed mb-6">
          {step.content}
        </p>

        <div className="flex justify-between items-center">
          <button 
             onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
             disabled={currentStep === 0}
             className="text-gray-400 hover:text-primary disabled:opacity-30 p-2"
          >
             <ChevronLeft size={20} />
          </button>

          <div className="flex gap-1">
             {STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-4 bg-accent' : 'w-1.5 bg-gray-200'}`} />
             ))}
          </div>

          <button 
             onClick={() => {
                if (isLast) {
                   onComplete();
                } else {
                   setCurrentStep(currentStep + 1);
                }
             }}
             className="flex items-center gap-1 bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-accent transition-colors"
          >
             {isLast ? '完成' : '下一步'} <ChevronRight size={14} />
          </button>
        </div>
        
        {/* Triangle Pointer (Simplified) */}
        {step.targetId && (
            <div 
              className={`absolute w-4 h-4 bg-surface rotate-45 border-l border-t border-white/20
                ${step.position === 'bottom' ? '-top-2 left-1/2 -translate-x-1/2' : ''}
                ${step.position === 'top' ? '-bottom-2 left-1/2 -translate-x-1/2 rotate-[225deg]' : ''}
              `}
            />
        )}
      </div>
    </div>
  );
};

export default TutorialOverlay;
