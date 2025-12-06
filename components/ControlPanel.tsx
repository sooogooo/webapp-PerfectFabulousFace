
import React, { useState } from 'react';
import { Sliders, ChevronDown, Shirt, RefreshCw, Loader2, Sun, Shuffle } from 'lucide-react';
import { BeautyConfig, StyleConfig, StyleCategory, FashionConfig, BackgroundConfig, OptionItem } from '../types';

interface ControlPanelProps {
  beautyConfig: BeautyConfig;
  setBeautyConfig: (config: BeautyConfig) => void;
  styleConfig: StyleConfig;
  setStyleConfig: (config: StyleConfig) => void;
  fashionConfig?: FashionConfig;
  setFashionConfig?: (config: FashionConfig) => void;
  backgroundConfig: BackgroundConfig;
  setBackgroundConfig: (config: BackgroundConfig) => void;
  isCollapsed?: boolean;
  
  // Dynamic Options Props
  styleOptions: Record<string, OptionItem[]>;
  fashionOptions: Record<string, OptionItem[]>;
  onRefreshOptions: (category: string, type: 'style' | 'fashion') => Promise<void>;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  beautyConfig, setBeautyConfig, 
  styleConfig, setStyleConfig, 
  fashionConfig, setFashionConfig, 
  backgroundConfig, setBackgroundConfig,
  isCollapsed = false,
  styleOptions, fashionOptions, onRefreshOptions
}) => {
  const [isOpen, setIsOpen] = useState(!isCollapsed);
  const [isFashionOpen, setIsFashionOpen] = useState(false);
  const [isBgOpen, setIsBgOpen] = useState(false);
  const [refreshingCat, setRefreshingCat] = useState<string | null>(null);

  const toggleFashion = (key: keyof FashionConfig, value: string) => {
    if (!setFashionConfig || !fashionConfig) return;
    const newValue = fashionConfig[key] === value ? undefined : value;
    setFashionConfig({ ...fashionConfig, [key]: newValue });
  };

  const handleRandomizeHairstyle = (e: React.MouseEvent) => {
     e.stopPropagation();
     if (!setFashionConfig || !fashionConfig || !fashionOptions.hairstyle) return;
     const options = fashionOptions.hairstyle;
     if (options.length === 0) return;
     const randomOption = options[Math.floor(Math.random() * options.length)];
     setFashionConfig({ ...fashionConfig, hairstyle: randomOption.id });
  };

  const handleRefresh = async (e: React.MouseEvent, category: string, type: 'style' | 'fashion') => {
    e.stopPropagation();
    if (refreshingCat) return;
    setRefreshingCat(category);
    await onRefreshOptions(category, type);
    setRefreshingCat(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
      <div 
         className="p-3 md:p-4 flex items-center justify-between cursor-pointer bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors"
         onClick={() => setIsOpen(!isOpen)}
      >
         <div className="flex items-center gap-2">
            <Sliders size={14} className="text-clinic-gold stroke-[1.5px]"/>
            <span className="text-xs font-medium text-gray-600 tracking-wide">美学控制台</span>
         </div>
         <ChevronDown size={14} className={`text-gray-300 transition-transform stroke-[1.5px] ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
      <div className="p-3 md:p-5 space-y-6 animate-fade-in">
        {/* Beauty Config Section */}
        <div>
          <h3 className="text-[10px] font-medium text-gray-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
            美颜微调
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
             <SliderControl 
               label="磨皮程度"
               value={beautyConfig.smooth} onChange={v => setBeautyConfig({...beautyConfig, smooth: v})} 
             />
             <SliderControl 
               label="美白提亮"
               value={beautyConfig.whiten} onChange={v => setBeautyConfig({...beautyConfig, whiten: v})} 
             />
             <SliderControl 
               label="高级感"
               value={beautyConfig.highClass} onChange={v => setBeautyConfig({...beautyConfig, highClass: v})} 
             />
             <SliderControl 
               label="富贵感"
               value={beautyConfig.rich} onChange={v => setBeautyConfig({...beautyConfig, rich: v})} 
             />
             <SliderControl 
               label="去风尘"
               value={beautyConfig.pure} onChange={v => setBeautyConfig({...beautyConfig, pure: v})} 
             />
             <SliderControl 
               label="去黑眼圈"
               value={beautyConfig.darkCircles} onChange={v => setBeautyConfig({...beautyConfig, darkCircles: v})} 
             />
             <SliderControl 
               label="去法令纹"
               value={beautyConfig.nasolabial} onChange={v => setBeautyConfig({...beautyConfig, nasolabial: v})} 
             />
             <SliderControl 
               label="下颌缘"
               value={beautyConfig.jawline} onChange={v => setBeautyConfig({...beautyConfig, jawline: v})} 
             />
          </div>
        </div>

        <div className="w-full h-px bg-gray-50" />

        {/* Style Config Section */}
        <div>
           <div className="flex justify-between items-center mb-3">
               <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                  风格定义
               </h3>
               {/* Refresh Style Button */}
               {styleConfig.category !== 'clinical' && (
                  <button 
                     onClick={(e) => handleRefresh(e, styleConfig.category, 'style')}
                     className="flex items-center gap-1 text-[9px] text-clinic-gold hover:text-clinic-dark transition-colors"
                     disabled={!!refreshingCat}
                  >
                     {refreshingCat === styleConfig.category ? <Loader2 size={10} className="animate-spin"/> : <RefreshCw size={10}/>}
                     <span>AI 刷新</span>
                  </button>
               )}
           </div>
           
           {/* Horizontal Scrollable Tabs */}
           <div className="flex overflow-x-auto pb-2 gap-2 mb-4 scrollbar-hide -mx-2 px-2">
              {(['clinical', 'classical', 'mood', 'status', 'tweak'] as StyleCategory[]).map(cat => (
                 <button
                   key={cat}
                   onClick={() => setStyleConfig({ ...styleConfig, category: cat, subOption: cat === 'clinical' ? 'standard' : styleOptions[cat as string]?.[0]?.id || 'standard' })}
                   className={`px-3 py-1.5 text-[11px] rounded-md whitespace-nowrap transition-all border ${
                      styleConfig.category === cat 
                      ? 'bg-primary text-white border-primary shadow-sm font-normal' 
                      : 'text-gray-500 border-gray-100 hover:bg-gray-50 font-light'
                   }`}
                 >
                   {cat === 'clinical' ? '标准' : cat === 'classical' ? '古典诗品' : cat === 'mood' ? '情绪美学' : cat === 'status' ? '状态美学' : '五官微调'}
                 </button>
              ))}
           </div>

           {/* Sub-options Grid */}
           {styleConfig.category !== 'clinical' && (
             <div className="bg-gray-50/50 p-3 rounded-lg mb-4 border border-gray-50">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                   {(styleOptions[styleConfig.category] || []).map((opt) => (
                     <div key={opt.id} className="group relative">
                        <button
                          onClick={() => setStyleConfig({ ...styleConfig, subOption: opt.id })}
                          className={`w-full py-2 text-[10px] rounded border transition-all truncate px-1 ${
                             styleConfig.subOption === opt.id
                             ? 'bg-primary border-primary text-white shadow-sm font-normal ring-1 ring-primary/50'
                             : 'border-transparent text-gray-500 hover:bg-white font-light'
                          }`}
                        >
                          {opt.label}
                        </button>
                        {/* Tooltip */}
                        {opt.tip && (
                           <div className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm font-light">
                              {opt.tip}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary"></div>
                           </div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
           )}

           <SliderControl 
              label="风格强度" 
              value={styleConfig.intensity} 
              onChange={v => setStyleConfig({...styleConfig, intensity: v})} 
           />
        </div>

        {/* Fashion Config Section */}
        {fashionConfig && setFashionConfig && (
          <>
            <div className="w-full h-px bg-gray-50" />
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                <div 
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setIsFashionOpen(!isFashionOpen)}
                >
                   <div className="flex items-center gap-2">
                      <Shirt size={12} className="text-gray-400 stroke-[1.5px]"/>
                      <h3 className="text-[10px] font-medium text-gray-500 tracking-wide">妆造与穿搭 <span className="text-[9px] font-light text-gray-300 ml-1">(多选)</span></h3>
                   </div>
                   <ChevronDown size={12} className={`text-gray-300 transition-transform stroke-[1.5px] ${isFashionOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isFashionOpen && (
                   <div className="p-3 space-y-4 border-t border-gray-50 bg-gray-50/30">
                      <FashionGroup 
                          title="发型" 
                          category="hairstyle" 
                          options={fashionOptions.hairstyle} 
                          selected={fashionConfig.hairstyle} 
                          onSelect={(v) => toggleFashion('hairstyle', v)} 
                          onRefresh={handleRefresh} 
                          refreshingCat={refreshingCat}
                          customAction={
                             <button onClick={handleRandomizeHairstyle} className="flex items-center gap-1 text-[9px] text-clinic-gold hover:text-clinic-dark transition-colors mr-2">
                                <Shuffle size={10} /> 随机
                             </button>
                          }
                      />
                      <FashionGroup title="头饰" category="headwear" options={fashionOptions.headwear} selected={fashionConfig.headwear} onSelect={(v) => toggleFashion('headwear', v)} onRefresh={handleRefresh} refreshingCat={refreshingCat}/>
                      <FashionGroup title="耳饰" category="earrings" options={fashionOptions.earrings} selected={fashionConfig.earrings} onSelect={(v) => toggleFashion('earrings', v)} onRefresh={handleRefresh} refreshingCat={refreshingCat}/>
                      <FashionGroup title="项链" category="necklace" options={fashionOptions.necklace} selected={fashionConfig.necklace} onSelect={(v) => toggleFashion('necklace', v)} onRefresh={handleRefresh} refreshingCat={refreshingCat}/>
                      <FashionGroup title="着装" category="clothing" options={fashionOptions.clothing} selected={fashionConfig.clothing} onSelect={(v) => toggleFashion('clothing', v)} onRefresh={handleRefresh} refreshingCat={refreshingCat}/>
                   </div>
                )}
            </div>
          </>
        )}

        {/* Background Config Section */}
        <div className="w-full h-px bg-gray-50" />
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
             <div 
               className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
               onClick={() => setIsBgOpen(!isBgOpen)}
             >
                <div className="flex items-center gap-2">
                   <Sun size={12} className="text-gray-400 stroke-[1.5px]"/>
                   <h3 className="text-[10px] font-medium text-gray-500 tracking-wide">环境与背景</h3>
                </div>
                <ChevronDown size={12} className={`text-gray-300 transition-transform stroke-[1.5px] ${isBgOpen ? 'rotate-180' : ''}`} />
             </div>
             
             {isBgOpen && (
                <div className="p-3 space-y-3 border-t border-gray-50 bg-gray-50/30">
                   <div className="flex flex-col gap-2">
                      <span className="text-[9px] text-gray-400 uppercase">光影风格</span>
                      <div className="flex flex-wrap gap-2">
                         {['studio', 'natural', 'cinematic', 'warm'].map(l => (
                            <button key={l} onClick={() => setBackgroundConfig({...backgroundConfig, lighting: l})} 
                            className={`px-3 py-1 text-[10px] rounded border transition-all font-light ${backgroundConfig.lighting === l ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-100'}`}>
                               {l === 'studio' ? '影棚光' : l === 'natural' ? '自然光' : l === 'cinematic' ? '电影感' : '暖调'}
                            </button>
                         ))}
                      </div>
                   </div>
                   <div className="flex flex-col gap-2">
                      <span className="text-[9px] text-gray-400 uppercase">背景环境</span>
                      <div className="flex flex-wrap gap-2">
                         {['solid', 'indoor', 'outdoor', 'artistic'].map(e => (
                            <button key={e} onClick={() => setBackgroundConfig({...backgroundConfig, environment: e})} 
                            className={`px-3 py-1 text-[10px] rounded border transition-all font-light ${backgroundConfig.environment === e ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-100'}`}>
                               {e === 'solid' ? '纯色' : e === 'indoor' ? '室内' : e === 'outdoor' ? '户外' : '艺术'}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
             )}
        </div>
      </div>
      )}
    </div>
  );
};

const FashionGroup = ({ 
   title, category, options, selected, onSelect, onRefresh, refreshingCat, customAction
}: { 
   title: string, category: string, options: OptionItem[], selected?: string, onSelect: (id: string) => void,
   onRefresh: (e: React.MouseEvent, category: string, type: 'style' | 'fashion') => void, refreshingCat: string | null, customAction?: React.ReactNode
}) => (
  <div className="space-y-2">
     <div className="flex justify-between items-center">
         <div className="flex items-center gap-2">
            <div className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">{title}</div>
            {customAction}
         </div>
         <button 
             onClick={(e) => onRefresh(e, category, 'fashion')}
             className="flex items-center gap-1 text-[9px] text-clinic-gold hover:text-clinic-dark transition-colors"
             disabled={!!refreshingCat}
          >
             {refreshingCat === category ? <Loader2 size={10} className="animate-spin"/> : <RefreshCw size={10}/>}
             <span>刷新</span>
         </button>
     </div>
     <div className="flex flex-wrap gap-2">
        {(options || []).map(opt => (
           <div key={opt.id} className="group relative">
               <button
                 onClick={() => onSelect(opt.id)}
                 className={`px-3 py-1.5 text-[10px] rounded border transition-all ${
                   selected === opt.id
                   ? 'bg-primary text-white border-primary shadow-sm font-normal ring-1 ring-primary/50'
                   : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 font-light'
                 }`}
               >
                 {opt.label}
               </button>
               {opt.tip && (
                   <div className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm font-light">
                      {opt.tip}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary"></div>
                   </div>
               )}
           </div>
        ))}
     </div>
  </div>
);

const SliderControl = ({ label, tip, value, onChange }: { label: string, tip?: string, value: number, onChange: (v: number) => void }) => (
  <div className="flex items-center gap-3 group relative py-1">
    <div className="flex items-center gap-1 w-16 md:w-20 shrink-0">
        <span className="text-[10px] font-light text-gray-500 cursor-help">{label}</span>
    </div>
    <div className="flex-1 h-6 flex items-center">
       <input 
         type="range" min="0" max="100" value={value} 
         onChange={(e) => onChange(parseInt(e.target.value))}
         className="w-full h-[2px] bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-accent transition-all"
       />
    </div>
    <span className="text-[10px] font-light text-gray-400 w-5 text-right">{value}</span>
  </div>
);

export default ControlPanel;
