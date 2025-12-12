
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
                      ? 'bg-gradient-to-br from-primary to-stone-600 text-white border-primary shadow-md font-normal' 
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
                             ? 'bg-gradient-to-br from-primary to-stone-600 border-primary text-white shadow-md font-normal ring-1 ring-primary/50'
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
              onChange={v => setStyleConfig({ ...styleConfig, intensity: v })} 
           />
        </div>

        <div className="w-full h-px bg-gray-50" />

        {/* Fashion Config Section */}
        {fashionConfig && setFashionConfig && (
            <div>
               <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[10px] font-medium text-gray-400 uppercase flex items-center gap-2 tracking-widest">
                     <Shirt size={12} /> 妆造与穿搭
                  </h3>
               </div>
               
               <div className="space-y-4">
                  {/* Hairstyle */}
                  <FashionSection 
                     title="发型" 
                     options={fashionOptions.hairstyle || []}
                     selected={fashionConfig.hairstyle}
                     onSelect={(id) => toggleFashion('hairstyle', id)}
                     onRefresh={(e) => handleRefresh(e, 'hairstyle', 'fashion')}
                     isRefreshing={refreshingCat === 'hairstyle'}
                     onRandom={(e) => handleRandomizeHairstyle(e)}
                  />
                  
                  {/* Headwear */}
                  <FashionSection 
                     title="头饰" 
                     options={fashionOptions.headwear || []}
                     selected={fashionConfig.headwear}
                     onSelect={(id) => toggleFashion('headwear', id)}
                     onRefresh={(e) => handleRefresh(e, 'headwear', 'fashion')}
                     isRefreshing={refreshingCat === 'headwear'}
                  />

                   {/* Earrings */}
                   <FashionSection 
                     title="耳饰" 
                     options={fashionOptions.earrings || []}
                     selected={fashionConfig.earrings}
                     onSelect={(id) => toggleFashion('earrings', id)}
                     onRefresh={(e) => handleRefresh(e, 'earrings', 'fashion')}
                     isRefreshing={refreshingCat === 'earrings'}
                  />

                  {/* Necklace */}
                  <FashionSection 
                     title="项链" 
                     options={fashionOptions.necklace || []}
                     selected={fashionConfig.necklace}
                     onSelect={(id) => toggleFashion('necklace', id)}
                     onRefresh={(e) => handleRefresh(e, 'necklace', 'fashion')}
                     isRefreshing={refreshingCat === 'necklace'}
                  />

                  {/* Clothing */}
                  <FashionSection 
                     title="服装" 
                     options={fashionOptions.clothing || []}
                     selected={fashionConfig.clothing}
                     onSelect={(id) => toggleFashion('clothing', id)}
                     onRefresh={(e) => handleRefresh(e, 'clothing', 'fashion')}
                     isRefreshing={refreshingCat === 'clothing'}
                  />

                  {/* Outerwear */}
                  <FashionSection 
                     title="外套" 
                     options={fashionOptions.outerwear || []}
                     selected={fashionConfig.outerwear}
                     onSelect={(id) => toggleFashion('outerwear', id)}
                     onRefresh={(e) => handleRefresh(e, 'outerwear', 'fashion')}
                     isRefreshing={refreshingCat === 'outerwear'}
                  />

                  {/* Footwear */}
                  <FashionSection 
                     title="鞋履" 
                     options={fashionOptions.footwear || []}
                     selected={fashionConfig.footwear}
                     onSelect={(id) => toggleFashion('footwear', id)}
                     onRefresh={(e) => handleRefresh(e, 'footwear', 'fashion')}
                     isRefreshing={refreshingCat === 'footwear'}
                  />

                  {/* Accessories */}
                  <FashionSection 
                     title="配饰" 
                     options={fashionOptions.accessories || []}
                     selected={fashionConfig.accessories}
                     onSelect={(id) => toggleFashion('accessories', id)}
                     onRefresh={(e) => handleRefresh(e, 'accessories', 'fashion')}
                     isRefreshing={refreshingCat === 'accessories'}
                  />
               </div>
            </div>
        )}

        <div className="w-full h-px bg-gray-50" />

        {/* Background Config */}
        <div>
           <h3 className="text-[10px] font-medium text-gray-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
              <Sun size={12} /> 环境光影
           </h3>
           <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] text-gray-500 mb-1.5 block">光照类型</label>
                  <select 
                     value={backgroundConfig.lighting} 
                     onChange={(e) => setBackgroundConfig({...backgroundConfig, lighting: e.target.value})}
                     className="w-full p-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-primary text-gray-600 font-light"
                  >
                     <option value="studio">专业影棚 (Studio)</option>
                     <option value="natural">自然柔光 (Natural)</option>
                     <option value="cinematic">电影感 (Cinematic)</option>
                     <option value="warm">暖调氛围 (Warm)</option>
                  </select>
               </div>
               <div>
                  <label className="text-[10px] text-gray-500 mb-1.5 block">背景环境</label>
                  <select 
                     value={backgroundConfig.environment} 
                     onChange={(e) => setBackgroundConfig({...backgroundConfig, environment: e.target.value})}
                     className="w-full p-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-primary text-gray-600 font-light"
                  >
                     <option value="solid">纯色背景 (Solid)</option>
                     <option value="indoor">高奢室内 (Indoor)</option>
                     <option value="outdoor">自然街景 (Outdoor)</option>
                     <option value="artistic">艺术纹理 (Artistic)</option>
                  </select>
               </div>
           </div>
        </div>

      </div>
      )}
    </div>
  );
};

// --- Helper Components ---

const SliderControl: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-center">
      <label className="text-[10px] text-gray-500 font-light">{label}</label>
      <span className="text-[10px] text-gray-400 font-mono w-6 text-right">{value}</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
    />
  </div>
);

const FashionSection: React.FC<{
   title: string;
   options: OptionItem[];
   selected?: string;
   onSelect: (id: string) => void;
   onRefresh: (e: React.MouseEvent) => void;
   isRefreshing: boolean;
   onRandom?: (e: React.MouseEvent) => void;
}> = ({ title, options, selected, onSelect, onRefresh, isRefreshing, onRandom }) => (
   <div className="group/section">
      <div className="flex items-center gap-2 mb-2">
         <span className="text-[10px] text-gray-500 font-light w-8">{title}</span>
         <div className="h-px bg-gray-50 flex-1"></div>
         {onRandom && (
            <button onClick={onRandom} className="text-gray-300 hover:text-primary transition-colors" title="随机一个">
               <Shuffle size={10} />
            </button>
         )}
         <button onClick={onRefresh} className="text-gray-300 hover:text-clinic-gold transition-colors" disabled={isRefreshing} title="AI 推荐更多">
            {isRefreshing ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
         </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
         {options.map(opt => (
            <button
               key={opt.id}
               onClick={() => onSelect(opt.id)}
               className={`px-2 py-1 text-[10px] rounded border transition-all ${
                  selected === opt.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
               }`}
               title={opt.tip}
            >
               {opt.label}
            </button>
         ))}
      </div>
   </div>
);

export default ControlPanel;
