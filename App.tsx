
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { 
  Sparkles, Download, ToggleLeft, ToggleRight, AlertCircle, FileDown, 
  Settings, ChevronRight, Loader2, Info, RefreshCw, Save, Plus, X, Trash2,
  Eye, EyeOff, Maximize
} from 'lucide-react';

import ImageUploader from './components/ImageUploader';
import AestheticRadarChart from './components/RadarChart';
import WordCloud from './components/WordCloud';
import ControlPanel from './components/ControlPanel';
import SettingsModal from './components/SettingsModal';
import MarkdownView from './components/MarkdownView';
import AboutModal from './components/AboutModal';
import TutorialOverlay from './components/TutorialOverlay'; 
import ImageViewer from './components/ImageViewer';

import { analyzeFaceMetrics, generateStyledPortrait, generateAnnotatedImage, suggestCreativeOptions, explainSelection, generateScenario, generateCreativeScenarios } from './services/geminiService';
import { AppState, ReportData, PortraitView, BeautyConfig, StyleConfig, FashionConfig, BackgroundConfig, OptionItem, CustomPrompts, AppSettings, ScenarioPreset, SavedPreset } from './types';

// EXPANDED INITIAL OPTIONS
const INITIAL_STYLE_OPTIONS: Record<string, OptionItem[]> = {
  classical: [
    { id: 'xionghun', label: '雄浑', tip: '气象雄伟，浑然一体' },
    { id: 'chongdan', label: '冲淡', tip: '淡泊宁静，气质清雅' },
    { id: 'dianya', label: '典雅', tip: '端庄高雅，贵族气质' },
    { id: 'xiannong', label: '纤秾', tip: '色彩鲜艳，富丽精致' },
    { id: 'xilian', label: '洗炼', tip: '简洁利落，去粗取精' },
    { id: 'jingjian', label: '劲健', tip: '健康有力，充满活力' },
    { id: 'qili', label: '绮丽', tip: '华丽光彩，明艳动人' },
    { id: 'ziran', label: '自然', tip: '清新脱俗，毫无矫饰' },
    { id: 'hanxu', label: '含蓄', tip: '意在言外，深沉内敛' },
    { id: 'haofang', label: '豪放', tip: '气度非凡，洒脱大气' },
    { id: 'chenzhuo', label: '沉着', tip: '深沉稳重，不露锋芒' },
    { id: 'gaogu', label: '高古', tip: '古朴高远，超凡脱俗' },
    { id: 'qingqi', label: '清奇', tip: '清秀奇特，风格独特' },
    { id: 'weiqu', label: '委曲', tip: '婉转含蓄，曲折幽深' },
    { id: 'shijing', label: '实境', tip: '真实自然，不尚空灵' },
    { id: 'beikai', label: '悲慨', tip: '慷慨悲歌，气势苍凉' },
    { id: 'xingrong', label: '形容', tip: '描绘细腻，形神兼备' },
    { id: 'chaoyi', label: '超诣', tip: '超凡脱俗，境界高远' },
    { id: 'piaoyi', label: '飘逸', tip: '飘逸若仙，灵动自由' },
    { id: 'kuangda', label: '旷达', tip: '心胸开阔，豁达大度' },
    { id: 'liudong', label: '流动', tip: '气韵生动，如行云流水' }
  ],
  mood: [
    { id: 'less_tired', label: '元气感', tip: '消除疲惫，提升精气神' },
    { id: 'younger', label: '幼态感', tip: '面部饱满，增加少女感' },
    { id: 'attractive', label: '吸引力', tip: '增强第一眼惊艳感' },
    { id: 'slimmer', label: '瘦脸感', tip: '收紧轮廓，视觉显瘦' },
    { id: 'qingleng', label: '清冷感', tip: '高冷疏离，气质独特' },
    { id: 'posui', label: '破碎感', tip: '脆弱惹人怜爱' },
    { id: 'songchi', label: '松弛感', tip: '毫不费力的时髦' },
    { id: 'zhixing', label: '智性恋', tip: '高智商精英气质' },
    { id: 'sweet', label: '甜美感', tip: '笑容甜美，亲和力强' },
    { id: 'melancholy', label: '忧郁感', tip: '文艺忧郁，故事感' }
  ],
  status: [
    { id: 'confident', label: '自信', tip: '气场全开，眼神坚定' },
    { id: 'trustworthy', label: '信赖感', tip: '真诚可靠，面部柔和' },
    { id: 'executive', label: '总裁感', tip: '智性审美，精英气质' },
    { id: 'mingyuan', label: '名媛感', tip: '精致贵气，生活优渥' },
    { id: 'shujuan', label: '书卷气', tip: '温润如玉，知性儒雅' },
    { id: 'artist', label: '艺术家', tip: '独特个性，不落俗套' },
    { id: 'protagonist', label: '主角光环', tip: '吸睛夺目，C位气场' },
    { id: 'energetic', label: '活力', tip: '元气满满' },
    { id: 'reliable', label: '稳重', tip: '踏实可靠，值得托付' },
    { id: 'wealthy', label: '老钱风', tip: '低调奢华，底蕴深厚' }
  ],
  tweak: [
    { id: 'big_eyes', label: '大眼', tip: '适度放大双眼' },
    { id: 'high_nose', label: '高鼻', tip: '垫高鼻梁，缩小鼻翼' },
    { id: 'small_face', label: '小脸', tip: '整体缩小面部轮廓' },
    { id: 'm_lips', label: 'M唇', tip: '立体唇峰，精致唇形' },
    { id: 'elf_ear', label: '精灵耳', tip: '显脸小，增加灵动感' },
    { id: 'wild_brows', label: '野生眉', tip: '自然毛流感' },
    { id: 'high_cranial', label: '高颅顶', tip: '头包脸，显脸小' },
    { id: 'shoulder', label: '直角肩', tip: '优美肩颈线条' },
    { id: 'plump', label: '幼态饱满', tip: '面部填充感，胶原蛋白' },
    { id: 'sharp_jaw', label: '下颌折角', tip: '清晰利落的下颌线' }
  ]
};

const INITIAL_FASHION_OPTIONS: Record<string, OptionItem[]> = {
  hairstyle: [
    { id: 'h_straight', label: '黑长直', tip: '清纯女神范' }, 
    { id: 'h_wavy', label: '大波浪', tip: '妩媚动人' }, 
    { id: 'h_french', label: '法式盘发', tip: '慵懒优雅' },
    { id: 'h_bob', label: '一刀切', tip: '干练酷飒' }, 
    { id: 'h_ponytail', label: '高马尾', tip: '活力减龄' }, 
    { id: 'h_wool', label: '羊毛卷', tip: '复古可爱' }, 
    { id: 'h_clavicle', label: '锁骨发', tip: '温柔知性' }, 
    { id: 'h_hime', label: '公主切', tip: '二次元撕漫感' }, 
    { id: 'h_wolf', label: '鲻鱼头', tip: '中性帅气' }, 
    { id: 'h_updo', label: '晚宴盘发', tip: '端庄正式' }
  ],
  headwear: [
    { id: 'hw_tiara', label: '钻石冠冕', tip: '女王气场' }, 
    { id: 'hw_ribbon', label: '丝绸发带', tip: '法式少女' }, 
    { id: 'hw_beret', label: '贝雷帽', tip: '文艺画家' },
    { id: 'hw_veil', label: '蕾丝面纱', tip: '神秘朦胧' }, 
    { id: 'hw_hairpin', label: '玉簪', tip: '古典温婉' }, 
    { id: 'hw_flower', label: '鲜花', tip: '森系自然' },
    { id: 'hw_band', label: '宽发箍', tip: '复古名伶' }, 
    { id: 'hw_turban', label: '丝巾', tip: '异域风情' },
    { id: 'hw_cap', label: '棒球帽', tip: '休闲街头' }
  ],
  earrings: [
    { id: 'e_studs', label: '钻石耳钉', tip: '简约闪耀' }, 
    { id: 'e_pearl', label: '珍珠', tip: '圆润典雅' }, 
    { id: 'e_hoops', label: '圆环', tip: '欧美大气' },
    { id: 'e_tassel', label: '流苏', tip: '修饰脸型' }, 
    { id: 'e_vintage', label: '复古金', tip: '做旧质感' }, 
    { id: 'e_jade', label: '翡翠', tip: '东方韵味' },
    { id: 'e_cuff', label: '耳骨夹', tip: '酷感十足' }, 
    { id: 'e_chandelier', label: '水晶吊灯', tip: '奢华晚宴' },
    { id: 'e_geometric', label: '几何金饰', tip: '现代艺术' },
    { id: 'e_flower', label: '花朵', tip: '清新柔美' }
  ],
  clothing: [
    { id: 'c_gown', label: '礼服', tip: '高定奢华' }, 
    { id: 'c_suit', label: '白西装', tip: '职场大女主' }, 
    { id: 'c_qipao', label: '旗袍', tip: '婀娜多姿' }, 
    { id: 'c_shirt', label: '白衬衫', tip: '纯欲天花板' },
    { id: 'c_turtleneck', label: '黑高领', tip: '乔布斯式极简' }, 
    { id: 'c_offshoulder', label: '一字肩', tip: '展露锁骨' }, 
    { id: 'c_tweed', label: '小香风', tip: '经典优雅' }, 
    { id: 'c_newchinese', label: '新中式', tip: '东方美学' },
    { id: 'c_slip', label: '吊带裙', tip: '性感慵懒' },
    { id: 'c_leather', label: '皮衣', tip: '机车酷感' }
  ],
  necklace: [
    { id: 'n_choker', label: 'Choker', tip: '修饰颈部' }, 
    { id: 'n_pearl', label: '珍珠项链', tip: '优雅传承' }, 
    { id: 'n_diamond', label: '钻石项链', tip: '璀璨夺目' },
    { id: 'n_gold', label: '细金链', tip: '精致锁骨' }, 
    { id: 'n_pendant', label: '宝石吊坠', tip: '视觉焦点' }, 
    { id: 'n_layered', label: '叠戴项链', tip: '层次丰富' },
    { id: 'n_collar', label: '金属项圈', tip: '未来感' },
    { id: 'n_locket', label: '相盒', tip: '复古情怀' }
  ]
};

const INITIAL_SCENARIO_PRESETS: ScenarioPreset[] = [
  { id: 'boss', name: '职场大女主', icon: '', description: '干练、自信、总裁感' },
  { id: 'princess', name: '在逃公主', icon: '', description: '甜美、高贵、钻石冠冕' },
  { id: 'scholar', name: '清冷学姐', icon: '', description: '智性、书卷气、黑长直' },
  { id: 'retro', name: '复古名伶', icon: '', description: '港风、明艳、大波浪' },
  { id: 'fairy', name: '森系精灵', icon: '', description: '自然、灵动、鲜花点缀' },
  { id: 'cybergirl', name: '赛博少女', icon: '', description: '酷飒、未来感、几何配饰' }
];

const AESTHETIC_QUOTES = [
  "颜值即正义，但气质是必杀技。", "美是千人千面，不是千人一面。", "你的脸是上帝写给世界的情书。",
  "主要看气质，次要看修图。", "优雅是唯一不会褪色的美。", "美不仅仅是视觉的愉悦，更是灵魂的共鸣。",
  "在这个看脸的时代，我们要看懂脸。", "美学不是玄学，是科学。", "好看的皮囊千篇一律，有趣的灵魂万里挑一。",
  "不被定义，才是真正的美。", "自信是最好的化妆品。", "你的美，独一无二。",
  "氛围感是最高级的美。", "骨相决定上限，皮相决定下限。", "美是和谐，是比例，是韵律。",
  "时尚易逝，风格永存。", "做自己的主角，自带光环。", "美没有标准答案。",
  "每一条皱纹都是时光的礼物（虽然我们想少一点）。", "美是自我悦纳的开始。", "接受自己的不完美，才是最大的完美。", "精致生活，从脸开始。", "美是力量，也是温柔。",
  "笑容是最好的滤镜。", "眼神里的光，是最好的高光。", "高级感源于克制。",
  "松弛感是美的最高境界。", "美在细节，也在整体。", "不要随波逐流，要引领潮流。",
  "美是动态的，不仅仅是静态的五官。", "你的脸，是你生活的样子。", "真正的美，是经得起推敲的。",
  "美是无声的语言。", "让美成为一种习惯。", "发现美，创造美，成为美。"
];

const LOADING_MESSAGES = [
   "正在测量五官比例...", 
   "正在分析面部折叠度...", 
   "正在构建3D骨相模型...", 
   "正在计算光影氛围...", 
   "正在渲染皮肤质感...", 
   "正在生成最终写真..."
];

// --- HELPER TO SAVE/SHARE FILE ---
const saveBlob = async (blob: Blob, fileName: string) => {
  // Check if we are on a mobile device (touch-enabled or small screen)
  // This is a rough check, but functional for PWA contexts
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0);

  // 1. Try Native Share (Mobile "Save to Photos" experience)
  if (isMobile && navigator.share && navigator.canShare) {
      const file = new File([blob], fileName, { type: blob.type });
      if (navigator.canShare({ files: [file] })) {
          try {
              await navigator.share({
                  files: [file],
                  title: 'Aesthetica Report',
              });
              return; // Shared successfully
          } catch (e: any) {
              if (e.name !== 'AbortError') {
                  console.warn('Share failed, falling back to download', e);
              } else {
                  return; // User cancelled
              }
          }
      }
  }

  // 2. Desktop Fallback: Force "Save As" by using octet-stream to prevent auto-open
  // This helps when browsers try to open JPG/PNG in a new tab or external viewer
  const forcedBlob = new Blob([blob], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(forcedBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- SPLASH COMPONENT ---
const Splash: React.FC<{onComplete: () => void}> = ({ onComplete }) => {
  const [quote, setQuote] = useState("");
  
  useEffect(() => {
    setQuote(AESTHETIC_QUOTES[Math.floor(Math.random() * AESTHETIC_QUOTES.length)]);
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center p-6 text-center animate-fade-in">
       <div className="mb-8 relative">
          <img src="https://docs.bccsw.cn/logo.png" alt="Logo" className="h-24 w-auto animate-bounce duration-1000" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-black/10 rounded-full blur-sm animate-pulse"></div>
       </div>
       <h1 className="text-2xl font-serif font-bold text-primary mb-2 tracking-widest">丽丽格格和美丽的脸</h1>
       <p className="text-xs text-accent uppercase tracking-[0.2em] mb-12">Perfect Fabulous Face</p>
       
       <div className="max-w-xs h-20 flex items-center justify-center">
          <p className="text-sm font-light text-gray-500 italic leading-relaxed animate-fade-in">
            “ {quote} ”
          </p>
       </div>
       
       <div className="absolute bottom-10 flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-gray-300" size={20}/>
          <span className="text-[10px] text-gray-300 tracking-wider">资源加载中...</span>
       </div>
    </div>
  );
};

const App: React.FC = () => {
  // --- Global State ---
  const [showSplash, setShowSplash] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false); // Tutorial State
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'default', fontSize: 'medium', aiTone: 'standard', aiLength: 'standard'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [selectionTooltip, setSelectionTooltip] = useState<{x: number, y: number, text: string} | null>(null);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);

  // --- Aesthetic Analysis State ---
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [currentView, setCurrentView] = useState<PortraitView>('front');
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [showFineTune, setShowFineTune] = useState<boolean>(false);
  const [showImageViewer, setShowImageViewer] = useState<boolean>(false); // Image Viewer State
  const [compareMode, setCompareMode] = useState<boolean>(false); // Comparison State
  const [loadingText, setLoadingText] = useState<string>(LOADING_MESSAGES[0]); // Streaming Text

  const [beautyConfig, setBeautyConfig] = useState<BeautyConfig>({ 
    smooth: 50, whiten: 30, highClass: 0, rich: 0, pure: 0, 
    darkCircles: 0, nasolabial: 0, jawline: 0 
  });
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({ category: 'clinical', subOption: 'standard', intensity: 50 });
  const [fashionConfig, setFashionConfig] = useState<FashionConfig>({});
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>({ lighting: 'studio', environment: 'solid' });
  
  const [styleOptions, setStyleOptions] = useState(INITIAL_STYLE_OPTIONS);
  const [fashionOptions, setFashionOptions] = useState(INITIAL_FASHION_OPTIONS);
  const [customPrompts, setCustomPrompts] = useState<CustomPrompts>({});
  
  const [scenarioPresets, setScenarioPresets] = useState<ScenarioPreset[]>(INITIAL_SCENARIO_PRESETS);
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);
  const [refreshingScenarios, setRefreshingScenarios] = useState(false);

  const [loadingView, setLoadingView] = useState(false);
  const [loadingAnnotation, setLoadingAnnotation] = useState(false);
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Touch gesture state
  const touchStartX = useRef<number | null>(null);

  // --- Effects ---
  useEffect(() => {
    document.body.className = `theme-${settings.theme} antialiased h-full overflow-hidden font-light tracking-wide text-stone-600`;
    const root = document.documentElement;
    if (settings.fontSize === 'small') root.style.setProperty('--font-size-base', '14px');
    if (settings.fontSize === 'medium') root.style.setProperty('--font-size-base', '16px');
    if (settings.fontSize === 'large') root.style.setProperty('--font-size-base', '18px');
  }, [settings]);

  // Streaming Loading Text Logic
  useEffect(() => {
     let interval: any;
     if (state === AppState.ANALYZING || loadingView) {
        let idx = 0;
        setLoadingText(LOADING_MESSAGES[0]);
        interval = setInterval(() => {
           idx = (idx + 1) % LOADING_MESSAGES.length;
           setLoadingText(LOADING_MESSAGES[idx]);
        }, 2000);
     }
     return () => clearInterval(interval);
  }, [state, loadingView]);

  // Load Saved Presets
  useEffect(() => {
    const saved = localStorage.getItem('user_presets');
    if (saved) {
      try {
        setSavedPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load presets", e);
      }
    }
  }, []);

  // Check for Tutorial
  useEffect(() => {
     if (!showSplash) {
        const hasSeenTutorial = localStorage.getItem('has_seen_tutorial');
        if (!hasSeenTutorial) {
           setTimeout(() => setShowTutorial(true), 1000);
        }
     }
  }, [showSplash]);

  const handleTutorialComplete = () => {
     setShowTutorial(false);
     localStorage.setItem('has_seen_tutorial', 'true');
  };

  // Selection Listener
  useEffect(() => {
    const handleSelection = () => {
       const selection = window.getSelection();
       if (selection && selection.toString().length > 1) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0) {
             setSelectionTooltip({ x: rect.left + rect.width/2, y: rect.top - 40, text: selection.toString() });
          }
       } else {
          setSelectionTooltip(null);
       }
    };
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  // --- Handlers ---

  const handleSavePreset = () => {
    const name = window.prompt("请输入预设名称：", `我的配置 ${savedPresets.length + 1}`);
    if (!name) return;

    const newPreset: SavedPreset = {
      id: Date.now().toString(),
      name,
      timestamp: Date.now(),
      config: {
        beauty: beautyConfig,
        style: styleConfig,
        fashion: fashionConfig,
        background: backgroundConfig
      }
    };

    const updatedPresets = [...savedPresets, newPreset];
    setSavedPresets(updatedPresets);
    localStorage.setItem('user_presets', JSON.stringify(updatedPresets));
  };

  const handleLoadPreset = (preset: SavedPreset) => {
    setBeautyConfig(preset.config.beauty);
    setStyleConfig(preset.config.style);
    setFashionConfig(preset.config.fashion);
    setBackgroundConfig(preset.config.background);
  };

  const handleDeletePreset = (id: string) => {
    if (!window.confirm("确定要删除这个预设吗？")) return;
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem('user_presets', JSON.stringify(updated));
  };

  const handleApplyScenario = async (scenarioId: string) => {
    const preset = scenarioPresets.find(p => p.id === scenarioId);
    if (!preset) return;
    
    setLoadingScenario(scenarioId);
    try {
      const configs = await generateScenario(preset.name);
      
      setBeautyConfig(configs.beauty);
      setStyleConfig(configs.style);
      setFashionConfig(configs.fashion);
      setBackgroundConfig(configs.background);
      
    } catch (e) {
      console.error("Scenario Error", e);
    } finally {
      setLoadingScenario(null);
    }
  };
  
  const handleRefreshScenarios = async () => {
     if (refreshingScenarios) return;
     setRefreshingScenarios(true);
     try {
       const newScenarios = await generateCreativeScenarios();
       if (newScenarios && newScenarios.length > 0) {
          setScenarioPresets(newScenarios);
       }
     } catch(e) {
        console.error("Failed refresh scenarios");
     } finally {
        setRefreshingScenarios(false);
     }
  };

  const handleExplain = async () => {
    if (!selectionTooltip) return;
    setTooltipContent("AI 正在思考...");
    const result = await explainSelection(selectionTooltip.text, settings);
    setTooltipContent(result);
  };

  const handleExportPNG = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, 
        backgroundColor: '#ffffff', 
        useCORS: true, 
        ignoreElements: (el) => el.classList.contains('no-capture')
      });
      
      canvas.toBlob(async (blob) => {
          if (blob) {
              await saveBlob(blob, 'Aesthetica-Report-Full.png');
          } else {
              alert("导出图片失败");
          }
      }, 'image/png');
    } catch (e) { 
      console.error(e);
      alert("导出失败，请重试"); 
    }
  };

  const handleDownloadImage = async () => {
     const imgData = getDisplayImage();
     if (!imgData) return;
     try {
         const res = await fetch(`data:image/jpeg;base64,${imgData}`);
         const blob = await res.blob();
         const fileName = `Aesthetica-${currentView}-${showAnnotations ? 'annotated' : 'clean'}.jpg`;
         await saveBlob(blob, fileName);
     } catch (e) {
         console.error(e);
         alert("下载失败");
     }
  };

  const handleRefreshOptions = async (category: string, type: 'style' | 'fashion') => {
     const existing = type === 'style' ? styleOptions[category] : fashionOptions[category];
     const { options, prompts } = await suggestCreativeOptions(category, existing?.map(o=>o.label)||[]);
     if (options.length > 0) {
        setCustomPrompts(p => ({...p, ...prompts}));
        if (type === 'style') setStyleOptions(p => ({...p, [category]: [...(p[category]||[]), ...options]}));
        else setFashionOptions(p => ({...p, [category]: [...(p[category]||[]), ...options]}));
     }
  };

  const handleAnalyze = async () => {
    if (!inputImage) return;
    setState(AppState.ANALYZING);
    setErrorMsg(null);
    try {
       await new Promise(r => setTimeout(r, 100));
       
       const [analysis, frontClean] = await Promise.all([
          analyzeFaceMetrics(inputImage, settings),
          generateStyledPortrait(inputImage, 'front', beautyConfig, styleConfig, fashionConfig, customPrompts)
       ]);
       const initial: ReportData = { analysis, images: { front: { clean: frontClean } } };
       setReportData(initial);
       setState(AppState.SUCCESS);
       
       if (showAnnotations) {
          try {
            const ann = await generateAnnotatedImage(frontClean, 'front', analysis.scores);
            setReportData(p => p ? {...p, images: {...p.images, front: {...p.images.front!, annotated: ann}}} : null);
          } catch(e) { console.warn("Annotation failed slightly"); }
       }
    } catch(e: any) {
       console.error("Main Analysis Error", e);
       setState(AppState.ERROR); 
       setErrorMsg(e.message || "分析过程中发生错误，请稍后重试。");
    }
  };

  const handleViewChange = async (view: PortraitView) => {
    setCurrentView(view);
    if (!reportData?.images[view]?.clean) {
       setLoadingView(true);
       try {
         const clean = await generateStyledPortrait(inputImage!, view, beautyConfig, styleConfig, fashionConfig, customPrompts);
         setReportData(p => p ? ({...p, images: {...p.images, [view]: {clean}}}) : null);
         if (showAnnotations) {
            const ann = await generateAnnotatedImage(clean, view, reportData!.analysis.scores);
            setReportData(p => p ? ({...p, images: {...p.images, [view]: {...p.images[view]!, annotated: ann}}}) : null);
         }
       } catch(e) {
          console.error("View Gen Error", e);
       } finally { 
          setLoadingView(false); 
       }
    }
  };

  const handleRegenerate = async () => {
     if (!inputImage || !reportData) return;
     setLoadingView(true);
     try {
         const clean = await generateStyledPortrait(inputImage, currentView, beautyConfig, styleConfig, fashionConfig, customPrompts);
         
         setReportData(prev => {
             if (!prev) return null;
             return {
                 ...prev,
                 images: {
                     ...prev.images,
                     [currentView]: { ...prev.images[currentView], clean }
                 }
             };
         });
 
         if (showAnnotations) {
              try {
                  const ann = await generateAnnotatedImage(clean, currentView, reportData.analysis.scores);
                  setReportData(prev => {
                     if (!prev) return null;
                     const imgObj = prev.images[currentView];
                     if (!imgObj) return prev;
                     return {
                         ...prev,
                         images: {
                             ...prev.images,
                             [currentView]: { ...imgObj, annotated: ann }
                         }
                     };
                  });
              } catch(e) { console.warn("Annotation refresh failed", e); }
         }
     } catch (e) {
         console.error("Regeneration failed", e);
         alert("生成失败，请重试");
     } finally {
         setLoadingView(false);
     }
  };

  const getDisplayImage = () => {
     const img = reportData?.images[currentView];
     if (!img) return null;
     return (showAnnotations && img.annotated) ? img.annotated : img.clean;
  };
  
  // Swipe Gestures
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const views: PortraitView[] = ['front', 'side45', 'side90'];
    const idx = views.indexOf(currentView);
    
    // Swipe Left -> Next
    if (diff > 50 && idx < views.length - 1) {
       handleViewChange(views[idx + 1]);
    }
    // Swipe Right -> Prev
    if (diff < -50 && idx > 0) {
       handleViewChange(views[idx - 1]);
    }
    touchStartX.current = null;
  };

  if (showSplash) return <Splash onComplete={() => setShowSplash(false)} />;

  return (
    <div className="flex flex-col h-full bg-background font-sans text-text selection:bg-accent/20">
       <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} onComplete={handleTutorialComplete} />
       <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} onUpdate={setSettings} />
       <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
       
       {showImageViewer && getDisplayImage() && (
          <ImageViewer src={`data:image/jpeg;base64,${compareMode && inputImage ? inputImage : getDisplayImage()}`} onClose={() => setShowImageViewer(false)} />
       )}

       {selectionTooltip && !tooltipContent && (
          <button 
             style={{ top: selectionTooltip.y, left: selectionTooltip.x }}
             className="fixed z-50 -translate-x-1/2 bg-primary text-white px-3 py-1.5 rounded-full text-xs shadow-xl animate-fade-in flex items-center gap-1 font-light tracking-wide"
             onClick={handleExplain}
          >
             <Sparkles size={10}/> AI 解读
          </button>
       )}
       {tooltipContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]" onClick={() => {setTooltipContent(null); setSelectionTooltip(null);}}>
             <div className="bg-surface p-6 rounded-xl max-w-xs shadow-[0_10px_40px_rgba(0,0,0,0.1)] animate-fade-in border border-white/50" onClick={e => e.stopPropagation()}>
                <h3 className="font-medium mb-3 text-accent text-sm">术语解读</h3>
                <p className="text-xs leading-relaxed text-gray-600 font-light">{tooltipContent}</p>
                <button onClick={() => {setTooltipContent(null); setSelectionTooltip(null);}} className="mt-4 w-full py-2 bg-gray-50 rounded text-xs text-gray-400 hover:text-gray-600">关闭</button>
             </div>
          </div>
       )}

       {/* Header */}
       <header className="bg-surface/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <img src="https://docs.bccsw.cn/logo.png" alt="Logo" className="h-6 w-auto opacity-80" />
                <h1 className="text-base font-serif font-bold tracking-wide text-primary">丽丽格格和美丽的脸</h1>
             </div>
             <div className="flex items-center gap-1">
                <button onClick={() => setShowAbout(true)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-primary transition-colors" title="关于"><Info size={18} strokeWidth={1.5}/></button>
                <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-primary transition-colors" title="设置"><Settings size={18} strokeWidth={1.5}/></button>
             </div>
          </div>
       </header>

       {/* Main Content */}
       <main className="flex-1 overflow-y-auto relative scrollbar-hide">
         <div className="max-w-4xl mx-auto px-4 pb-12 pt-4 md:pt-6">
            
            {/* Input & Control Section */}
            <div className={state === AppState.SUCCESS ? 'hidden' : 'block'}>
               {state === AppState.IDLE && !inputImage && (
                  <div className="text-center mb-8 animate-fade-in">
                     <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3 tracking-wide">探索你的千面之美</h2>
                     <p className="text-sm text-gray-400 font-light tracking-widest uppercase">上传照片，解锁你的专属美学密码与无限风格</p>
                  </div>
               )}

               {state !== AppState.ANALYZING && (
                  <div id="upload-section">
                    <ImageUploader onImageSelected={(b) => {setInputImage(b); setState(AppState.IDLE); setReportData(null); setErrorMsg(null);}} selectedImage={inputImage} onClear={() => {setInputImage(null); setReportData(null); setErrorMsg(null);}} />
                  </div>
               )}

               {state === AppState.ERROR && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3 border border-red-100">
                     <AlertCircle size={20}/>
                     <div className="flex-1 text-sm">{errorMsg || "发生未知错误"}</div>
                     <button onClick={() => {setState(AppState.IDLE); setErrorMsg(null);}} className="text-xs underline">重试</button>
                  </div>
               )}

               {inputImage && state !== AppState.ANALYZING && (
                  <div className="mt-4 mb-6 space-y-4">
                     {/* User Presets & AI Shortcuts Code (Kept same) */}
                     {/* ... (Existing Presets Code) ... */}
                     <div className="mb-4">
                        <div className="flex justify-between items-center px-1 mb-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 tracking-wide uppercase">
                                <Save size={12} className="text-clinic-gold"/> 我的预设配置
                            </div>
                            <button onClick={handleSavePreset} className="flex items-center gap-1 text-[10px] text-clinic-gold hover:text-clinic-dark transition-colors border border-clinic-gold/30 px-2 py-1 rounded-full bg-white"><Plus size={10}/> 保存当前</button>
                        </div>
                        {savedPresets.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {savedPresets.map(preset => (
                                    <div key={preset.id} className="relative group">
                                        <button onClick={() => handleLoadPreset(preset)} className="w-full bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-left">
                                            <div className="text-xs font-medium text-gray-700 truncate">{preset.name}</div>
                                            <div className="text-[9px] text-gray-400 font-light truncate">{new Date(preset.timestamp).toLocaleDateString()}</div>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeletePreset(preset.id); }} className="absolute top-1 right-1 p-1 text-gray-300 hover:text-red-400 transition-colors bg-white/80 rounded-full hover:bg-red-50"><X size={10} /></button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-[10px] text-gray-300 font-light px-1 italic border border-dashed border-gray-100 p-2 rounded-lg text-center">暂无保存的预设。</div>
                        )}
                     </div>

                     <div id="preset-section">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 tracking-wide uppercase"><Sparkles size={12} className="text-clinic-gold"/> 智能场景快捷方式</div>
                            <button onClick={handleRefreshScenarios} disabled={refreshingScenarios} className="flex items-center gap-1 text-[10px] text-clinic-gold hover:text-clinic-dark transition-colors">
                                {refreshingScenarios ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12}/>} 换一批
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {scenarioPresets.map(preset => (
                            <button key={preset.id} onClick={() => handleApplyScenario(preset.id)} disabled={!!loadingScenario} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-left group relative overflow-hidden">
                                <div className="text-xs font-medium text-gray-700 mb-1">{preset.name}</div>
                                <div className="text-[9px] text-gray-400 font-light truncate">{preset.description}</div>
                                {loadingScenario === preset.id && (<div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 size={16} className="animate-spin text-accent"/></div>)}
                            </button>
                            ))}
                        </div>
                     </div>
                     
                     <div id="control-panel">
                        <ControlPanel 
                            beautyConfig={beautyConfig} setBeautyConfig={setBeautyConfig}
                            styleConfig={styleConfig} setStyleConfig={setStyleConfig}
                            fashionConfig={fashionConfig} setFashionConfig={setFashionConfig}
                            backgroundConfig={backgroundConfig} setBackgroundConfig={setBackgroundConfig}
                            styleOptions={styleOptions} fashionOptions={fashionOptions}
                            onRefreshOptions={handleRefreshOptions}
                            isCollapsed={state === AppState.IDLE} 
                        />
                     </div>
                     <button onClick={handleAnalyze} className="mt-6 w-full py-4 bg-primary text-surface font-medium tracking-widest uppercase rounded-lg shadow-sm hover:bg-accent transition-colors flex justify-center items-center gap-2 text-sm">
                        <Sparkles size={16}/> 生成美学报告
                     </button>
                  </div>
               )}
            </div>

            {state === AppState.ANALYZING && (
               <div className="py-32 text-center text-text-muted font-light animate-fade-in">
                 <div className="relative w-20 h-20 mx-auto mb-6">
                   <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
                   <div className="absolute inset-0 border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                   <Sparkles className="absolute inset-0 m-auto text-accent animate-pulse" size={24}/>
                 </div>
                 <p className="text-lg text-primary font-medium mb-2">丽丽与格格 正在编制美梦中 ...</p>
                 <p className="text-xs opacity-60 animate-pulse">{loadingText}</p>
               </div>
            )}

            {state === AppState.SUCCESS && reportData && (
               <div className="animate-fade-in space-y-6 w-full max-w-[794px] mx-auto">
                  <div className="flex justify-between items-center no-capture">
                     <button onClick={() => {setInputImage(null); setReportData(null); setState(AppState.IDLE);}} className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1">
                        <ChevronRight className="rotate-180" size={12}/> 重新分析
                     </button>
                     <div className="flex gap-2">
                        <button onClick={handleExportPNG} className="px-3 py-1.5 bg-primary text-white text-xs rounded-full flex gap-1 items-center shadow-sm hover:bg-opacity-90 transition-colors">
                           <FileDown size={14}/> 下载报告
                        </button>
                     </div>
                  </div>

                  {/* Report Container to Capture */}
                  <div ref={reportRef} className="bg-background space-y-6">
                     <div className="grid lg:grid-cols-2 gap-6">
                        {/* Image Section */}
                        <div className="space-y-3">
                           <div 
                              className="bg-white p-1 rounded-lg border border-gray-100 relative min-h-[300px] cursor-pointer group"
                              onClick={() => setShowImageViewer(true)}
                              onTouchStart={onTouchStart}
                              onTouchEnd={onTouchEnd}
                           >
                              {getDisplayImage() && (
                                <img 
                                  src={`data:image/jpeg;base64,${compareMode && inputImage ? inputImage : getDisplayImage()}`} 
                                  className="w-full h-auto object-contain rounded max-h-[70vh] mx-auto transition-opacity duration-300" 
                                  alt="Portrait"
                                />
                              )}
                              {/* Hover Hint */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                 <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm flex items-center gap-1">
                                    <Maximize size={12}/> 点击全屏查看
                                 </div>
                              </div>
                              
                              {(loadingView || loadingAnnotation) && (
                                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10">
                                    <Loader2 className="animate-spin text-accent mb-2" size={32}/>
                                    <p className="text-xs text-gray-500 font-light animate-pulse">{loadingText}</p>
                                </div>
                              )}
                           </div>
                           
                           {/* Toolbar */}
                           <div className="flex flex-wrap justify-between items-center gap-2 no-capture">
                              <div className="flex gap-2 items-center">
                                 <button onClick={handleDownloadImage} className="p-2 bg-white rounded-full border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-colors" title="下载当前图片">
                                    <Download size={16}/>
                                 </button>
                                 <button 
                                    onMouseDown={() => setCompareMode(true)}
                                    onMouseUp={() => setCompareMode(false)}
                                    onTouchStart={() => setCompareMode(true)}
                                    onTouchEnd={() => setCompareMode(false)}
                                    className={`p-2 rounded-full border transition-colors ${compareMode ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:text-primary'}`}
                                    title="按住对比原图"
                                 >
                                    {compareMode ? <Eye size={16}/> : <EyeOff size={16}/>}
                                 </button>
                                 <button onClick={() => setShowAnnotations(!showAnnotations)} className="p-2 bg-white rounded-full border border-gray-200 hover:border-primary transition-colors" title="切换标注">
                                   {showAnnotations ? <ToggleRight className="text-accent" size={20}/> : <ToggleLeft className="text-gray-300" size={20}/>}
                                 </button>
                                 <button onClick={() => setShowFineTune(!showFineTune)} className={`px-3 py-1.5 border rounded-full text-xs transition-all ${showFineTune ? 'bg-gray-50 border-gray-300 text-primary' : 'bg-white border-gray-200 text-gray-500 hover:text-primary'}`}>
                                    微调
                                 </button>
                              </div>
                              <div className="flex gap-1 bg-white p-1 rounded-full border border-gray-200">
                                 {['front', 'side45', 'side90'].map((v: any) => (
                                    <button key={v} onClick={() => handleViewChange(v)} className={`px-3 py-1 text-[10px] rounded-full transition-all ${currentView === v ? 'bg-primary text-white font-medium' : 'text-gray-500 hover:text-primary'}`}>
                                       {v === 'front' ? '正面' : v === 'side45' ? '45°' : '侧颜'}
                                    </button>
                                 ))}
                              </div>
                           </div>
                           
                           {/* Fine Tune Panel - hidden in capture */}
                           {showFineTune && (
                              <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100 no-capture shadow-sm relative z-20">
                                 <ControlPanel 
                                    beautyConfig={beautyConfig} setBeautyConfig={setBeautyConfig}
                                    styleConfig={styleConfig} setStyleConfig={setStyleConfig}
                                    fashionConfig={fashionConfig} setFashionConfig={setFashionConfig}
                                    backgroundConfig={backgroundConfig} setBackgroundConfig={setBackgroundConfig}
                                    styleOptions={styleOptions} fashionOptions={fashionOptions}
                                    onRefreshOptions={handleRefreshOptions}
                                 />
                                 <button 
                                    onClick={handleRegenerate} 
                                    disabled={loadingView}
                                    className="mt-3 w-full py-2.5 bg-accent text-white text-xs rounded-lg font-medium tracking-wide hover:bg-opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                 >
                                    {loadingView ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                                    {loadingView ? "正在生成..." : "应用设置并重新生成"}
                                 </button>
                              </div>
                           )}
                        </div>

                        {/* Metrics Section */}
                        <div className="space-y-4">
                           <div className="bg-surface p-5 rounded-xl border border-gray-50 shadow-sm">
                              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">美学简评</h3>
                              <MarkdownView content={reportData.analysis.summary} />
                           </div>
                           <div className="bg-surface p-4 rounded-xl border border-gray-50 shadow-sm">
                              <AestheticRadarChart scores={reportData.analysis.scores} />
                           </div>
                           <div className="bg-surface p-6 rounded-xl border border-gray-50 shadow-sm">
                              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3 text-center">颜值特点</h3>
                              <WordCloud keywords={reportData.analysis.keywords} />
                              <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-200">
                                 <span className="text-4xl font-extralight text-accent">{reportData.analysis.scores.total}</span>
                                 <span className="text-[10px] text-gray-400 block uppercase tracking-widest mt-1">综合评分</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Bottom Info Footer */}
         <div className="bg-[#fcfcfc] border-t border-gray-50 text-gray-400 py-10 px-6 text-[10px] text-center leading-loose font-light">
             <p className="font-medium text-gray-600 mb-2">重庆联合丽格科技有限公司</p>
             <p>重庆市渝中区临江支路28号</p>
             <p>yuxiaodong@beaucare.org | 023-63326559</p>
             <a href="https://beian.miit.gov.cn/" target="_blank" className="hover:text-primary transition-colors border-b border-gray-200 pb-0.5">渝 ICP 备 2024023473 号</a>
             <div className="mt-6 flex flex-col items-center gap-2">
                <a href="https://work.weixin.qq.com/kfid/kfc193e1c58e9c203c2" target="_blank">
                   <img src="https://docs.bccsw.cn/images/dr-he/dr-he-brcode.png" alt="QR" className="w-20 h-20 bg-white p-1 rounded border border-gray-100" />
                </a>
                <span>联系客服</span>
             </div>
          </div>
       </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(<App />);
