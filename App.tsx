import React, { useState, useEffect } from 'react';
import { Settings, MessageCircle, HelpCircle, History, Sparkles } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ControlPanel from './components/ControlPanel';
import AestheticRadarChart from './components/RadarChart';
import WordCloud from './components/WordCloud';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import TutorialOverlay from './components/TutorialOverlay';
import HistoryModal from './components/HistoryModal';
import { 
  BeautyConfig, StyleConfig, FashionConfig, BackgroundConfig, 
  AppSettings, AnalysisResult, AppState, OptionItem, ReportData 
} from './types';
import { analyzeFace, getDynamicOptions } from './services/geminiService';

const DEFAULT_BEAUTY: BeautyConfig = {
  smooth: 50, whiten: 30, highClass: 20, rich: 0, pure: 40, darkCircles: 50, nasolabial: 30, jawline: 40
};

const DEFAULT_STYLE: StyleConfig = {
  category: 'clinical', subOption: 'standard', intensity: 50
};

const DEFAULT_FASHION: FashionConfig = {
  hairstyle: 'h_long', clothing: 'c_shirt'
};

const DEFAULT_BACKGROUND: BackgroundConfig = {
  lighting: 'studio', environment: 'solid'
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'default', fontSize: 'medium', aiTone: 'standard', aiLength: 'standard', mode: 'lite'
};

const STORAGE_KEY = 'LILI_GEGE_CONFIG_V1';

const App: React.FC = () => {
  // Load saved configuration from localStorage
  const [savedConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to load config', e);
      return null;
    }
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  const [beautyConfig, setBeautyConfig] = useState<BeautyConfig>(savedConfig?.beautyConfig || DEFAULT_BEAUTY);
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(savedConfig?.styleConfig || DEFAULT_STYLE);
  const [fashionConfig, setFashionConfig] = useState<FashionConfig>(savedConfig?.fashionConfig || DEFAULT_FASHION);
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>(savedConfig?.backgroundConfig || DEFAULT_BACKGROUND);
  const [settings, setSettings] = useState<AppSettings>(savedConfig?.settings || DEFAULT_SETTINGS);

  // Persist configuration changes
  useEffect(() => {
    const configToSave = {
      beautyConfig,
      styleConfig,
      fashionConfig,
      backgroundConfig,
      settings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
  }, [beautyConfig, styleConfig, fashionConfig, backgroundConfig, settings]);

  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [history, setHistory] = useState<ReportData[]>([]);

  const [fashionOptions, setFashionOptions] = useState<Record<string, OptionItem[]>>({
    hairstyle: [
        { id: 'h_long', label: '长直发', tip: '清纯自然' },
        { id: 'h_wavy', label: '大波浪', tip: '成熟妩媚' },
        { id: 'h_bob', label: '波波头', tip: '干练减龄' }
    ],
    headwear: [
        { id: 'hw_beret', label: '贝雷帽', tip: '复古文艺' }
    ],
    earrings: [
        { id: 'e_pearl', label: '珍珠耳钉', tip: '优雅气质' }
    ],
    necklace: [],
    clothing: [
        { id: 'c_jk', label: 'JK制服', tip: '青春校园' },
        { id: 'c_boho', label: '波西米亚', tip: '浪漫度假' },
        { id: 'c_hoodie', label: '卫衣', tip: '舒适潮流' },
        { id: 'c_sweater', label: '针织衫', tip: '温柔慵懒' },
        { id: 'c_crop', label: '辣妹装', tip: 'Y2K千禧风' },
        { id: 'c_dress', label: '连衣裙', tip: '优雅大方' },
        { id: 'c_skirt', label: '半身裙', tip: '灵动百搭' },
        { id: 'c_blouse', label: '衬衫', tip: '职场知性' },
        { id: 'c_activewear', label: '运动装', tip: '活力健康' }
    ],
    outerwear: [
        { id: 'o_trench', label: '风衣', tip: '知性优雅' },
        { id: 'o_blazer', label: '西装外套', tip: '职业干练' }
    ],
    footwear: [],
    accessories: []
  });

  const [styleOptions, setStyleOptions] = useState<Record<string, OptionItem[]>>({
    classical: [
        { id: 's_song', label: '宋代淡雅', tip: '极简雅致' },
        { id: 's_tang', label: '盛唐富贵', tip: '雍容华贵' }
    ],
    mood: [
        { id: 'm_emo', label: '清冷感', tip: '疏离高智' },
        { id: 'm_sweet', label: '甜美感', tip: '元气少女' }
    ],
    status: [
        { id: 'st_boss', label: '职场精英', tip: '气场全开' },
        { id: 'st_chill', label: '松弛感', tip: '自在从容' }
    ],
    tweak: [
        { id: 't_eyes', label: '眼睑下至', tip: '无辜眼' },
        { id: 't_nose', label: '盒鼻', tip: '立体精致' }
    ]
  });

  const handleImageSelected = async (base64: string) => {
    setSelectedImage(base64);
    setAppState(AppState.ANALYZING);
    try {
        const result = await analyzeFace(base64);
        setAnalysisResult(result);
        
        const newReport: ReportData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            images: { front: { clean: base64.replace(/^data:image\/\w+;base64,/, '') } },
            analysis: { ...result, timestamp: Date.now() }
        };
        setHistory(prev => [newReport, ...prev]);
        setAppState(AppState.SUCCESS);
    } catch (e) {
        console.error(e);
        setAppState(AppState.ERROR);
    }
  };

  const handleClear = () => {
      setSelectedImage(null);
      setAnalysisResult(null);
      setAppState(AppState.IDLE);
  };

  const handleRefreshOptions = async (category: string, type: 'style' | 'fashion') => {
      const newOptions = await getDynamicOptions(category, type);
      if (newOptions.length > 0) {
          if (type === 'style') {
              setStyleOptions(prev => ({ ...prev, [category]: newOptions }));
          } else {
              setFashionOptions(prev => ({ ...prev, [category]: newOptions }));
          }
      }
  };

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-800 font-sans ${settings.theme === 'mint' ? 'theme-mint' : settings.theme === 'rose' ? 'theme-rose' : ''}`}>
      <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} onComplete={() => setShowTutorial(false)} />
      
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} onUpdate={setSettings} />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <HistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history} 
        onRestore={(item) => {
            if (item.images.front?.clean) {
                setSelectedImage(`data:image/jpeg;base64,${item.images.front.clean}`);
                setAnalysisResult(item.analysis);
                setAppState(AppState.SUCCESS);
            }
        }} 
        onDelete={(ts) => setHistory(h => h.filter(x => x.analysis.timestamp !== ts))} 
      />

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-serif italic font-bold">L</div>
           <h1 className="font-serif font-bold text-lg tracking-wide">Lili Gege <span className="text-xs font-sans font-normal text-gray-500 ml-1">AI Aesthetics</span></h1>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => setShowHistory(true)} className="p-2 text-gray-500 hover:text-black transition-colors"><History size={20}/></button>
           <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 hover:text-black transition-colors"><Settings size={20}/></button>
           <button onClick={() => setShowAbout(true)} className="p-2 text-gray-500 hover:text-black transition-colors"><HelpCircle size={20}/></button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 pb-24">
         <section id="upload-section">
            <ImageUploader 
                onImageSelected={handleImageSelected} 
                selectedImage={selectedImage} 
                onClear={handleClear} 
            />
         </section>

         {appState === AppState.ANALYZING && (
             <div className="w-full py-12 flex flex-col items-center justify-center animate-pulse">
                <Sparkles className="text-primary mb-4 animate-spin-slow" size={32} />
                <p className="text-sm font-light text-gray-500">正在分析面部美学特征...</p>
             </div>
         )}

         {appState === AppState.SUCCESS && analysisResult && (
             <div className="animate-fade-in space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">美学雷达</h3>
                         <AestheticRadarChart scores={analysisResult.scores} />
                     </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">风格关键词</h3>
                         <WordCloud keywords={analysisResult.keywords} />
                         <div className="mt-auto pt-4 border-t border-gray-50">
                             <p className="text-sm text-gray-600 font-light leading-relaxed">{analysisResult.summary}</p>
                         </div>
                     </div>
                 </div>

                 <div id="control-panel">
                     <ControlPanel 
                        beautyConfig={beautyConfig} setBeautyConfig={setBeautyConfig}
                        styleConfig={styleConfig} setStyleConfig={setStyleConfig}
                        fashionConfig={fashionConfig} setFashionConfig={setFashionConfig}
                        backgroundConfig={backgroundConfig} setBackgroundConfig={setBackgroundConfig}
                        styleOptions={styleOptions}
                        fashionOptions={fashionOptions}
                        onRefreshOptions={handleRefreshOptions}
                     />
                 </div>
                 
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[500px] flex flex-col">
                     <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                        <MessageCircle size={16} className="text-primary"/>
                        <span className="text-sm font-medium">美学顾问</span>
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <ChatInterface settings={settings} />
                     </div>
                 </div>
             </div>
         )}
      </main>
    </div>
  );
};

export default App;