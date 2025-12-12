
import React from 'react';
import { X, Palette, Type, LayoutTemplate } from 'lucide-react';
import { AppSettings, FontSize, AppMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  const update = (key: keyof AppSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full md:w-[480px] md:rounded-2xl rounded-t-2xl shadow-2xl h-auto flex flex-col animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-serif font-bold text-primary">设置</h2>
          <button onClick={onClose}><X className="text-text-muted hover:text-primary" /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* App Mode */}
          <section>
             <div className="flex items-center gap-2 mb-3 text-sm font-bold text-text-muted uppercase tracking-wider">
               <LayoutTemplate size={14} /> 界面模式
             </div>
             <div className="bg-background rounded-lg p-1 flex">
                {(['lite', 'pro'] as AppMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => update('mode', m)}
                    className={`flex-1 py-2 text-sm rounded-md transition-all flex items-center justify-center gap-2 ${settings.mode === m ? 'bg-surface shadow-sm text-primary font-bold' : 'text-text-muted'}`}
                  >
                    {m === 'lite' ? '简洁版' : '专业版'}
                  </button>
                ))}
             </div>
             <p className="text-[10px] text-gray-400 mt-2 font-light">简洁版适合快速一键美颜，专业版提供多维数据分析与精细控制。</p>
          </section>

          {/* Theme */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-text-muted uppercase tracking-wider">
              <Palette size={14} /> 界面主题
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => update('theme', 'default')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.theme === 'default' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-gray-200'}`}
              >
                <div className="w-6 h-6 rounded-full bg-[#f5f0eb] border border-gray-300"></div>
                <span className="text-xs">优雅米白</span>
              </button>
              <button 
                onClick={() => update('theme', 'mint')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.theme === 'mint' ? 'border-[#7FA99B] bg-[#F0F7F4] ring-1 ring-[#7FA99B]' : 'border-gray-200'}`}
              >
                <div className="w-6 h-6 rounded-full bg-[#F0F7F4] border border-[#7FA99B]"></div>
                <span className="text-xs">柔和薄荷</span>
              </button>
              <button 
                onClick={() => update('theme', 'rose')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.theme === 'rose' ? 'border-[#E0A6AA] bg-[#F9F0F2] ring-1 ring-[#E0A6AA]' : 'border-gray-200'}`}
              >
                <div className="w-6 h-6 rounded-full bg-[#F9F0F2] border border-[#E0A6AA]"></div>
                <span className="text-xs">浪漫粉紫</span>
              </button>
            </div>
          </section>

          {/* Font Size */}
          <section>
             <div className="flex items-center gap-2 mb-3 text-sm font-bold text-text-muted uppercase tracking-wider">
               <Type size={14} /> 字体大小
             </div>
             <div className="bg-background rounded-lg p-1 flex">
                {(['small', 'medium', 'large'] as FontSize[]).map(s => (
                  <button
                    key={s}
                    onClick={() => update('fontSize', s)}
                    className={`flex-1 py-2 text-sm rounded-md transition-all ${settings.fontSize === s ? 'bg-surface shadow-sm text-primary font-bold' : 'text-text-muted'}`}
                  >
                    {s === 'small' ? '小' : s === 'medium' ? '中' : '大'}
                  </button>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
