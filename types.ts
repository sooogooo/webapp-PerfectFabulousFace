
export interface AestheticScores {
  eyes: number;
  cheeks: number;
  lips: number;
  brows: number;
  jawline: number;
  symmetry: number;
  total: number;
}

export interface AnalysisResult {
  scores: AestheticScores;
  summary: string;
  keywords: string[];
  timestamp?: number;
}

export type PortraitView = 'front' | 'side45' | 'side90';

// --- Configuration Types ---

export interface BeautyConfig {
  smooth: number;      // 0-100
  whiten: number;      // 0-100
  highClass: number;   // 0-100
  rich: number;        // 0-100
  pure: number;        // 0-100
  darkCircles: number; // 0-100
  nasolabial: number;  // 0-100
  jawline: number;     // 0-100
}

export type StyleCategory = 'clinical' | 'classical' | 'mood' | 'status' | 'tweak';

export interface StyleConfig {
  category: StyleCategory;
  subOption: string;
  intensity: number;
}

export interface FashionConfig {
  hairstyle?: string;
  headwear?: string;
  earrings?: string;
  necklace?: string;
  clothing?: string;
  outerwear?: string;
  footwear?: string;
  accessories?: string;
}

export interface BackgroundConfig {
  lighting: string;
  environment: string;
}

export interface OptionItem {
  id: string;
  label: string;
  tip?: string;
}

export type CustomPrompts = Record<string, string>;

export interface ViewImages {
  clean: string;
  annotated?: string;
}

export interface ReportData {
  id?: string;
  date?: string;
  images: {
    front?: ViewImages;
    side45?: ViewImages;
    side90?: ViewImages;
  };
  analysis: AnalysisResult;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

// --- APP SETTINGS ---

export type ThemeType = 'default' | 'mint' | 'rose';
export type FontSize = 'small' | 'medium' | 'large';
export type AITone = 'humorous' | 'standard' | 'scientific';
export type AILength = 'detailed' | 'standard' | 'concise';
export type AppMode = 'lite' | 'pro'; // New App Mode

export interface AppSettings {
  theme: ThemeType;
  fontSize: FontSize;
  aiTone: AITone;
  aiLength: AILength;
  mode: AppMode; // Include mode in settings
}

// --- CHAT TYPES ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  suggestedQuestions?: string[];
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface SavedPreset {
  id: string;
  name: string;
  timestamp: number;
  config: {
    beauty: BeautyConfig;
    style: StyleConfig;
    fashion: FashionConfig;
    background: BackgroundConfig;
  };
}

export interface TutorialStep {
  targetId?: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}
