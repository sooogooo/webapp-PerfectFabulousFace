
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, PortraitView, BeautyConfig, StyleConfig, FashionConfig, OptionItem, CustomPrompts, AppSettings, BackgroundConfig, ScenarioPreset } from "../types";

// Helper to remove the data URL prefix if present
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

// --- IMAGE OPTIMIZATION HELPER ---
// Resizes image to max 1024px to prevent timeouts on mobile networks and speed up AI inference
const compressAndResizeImage = async (base64Str: string, maxWidth = 1024, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(cleanBase64(base64Str)); // Fallback
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      // Return clean base64 directly
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(cleanBase64(compressedDataUrl));
    };
    img.onerror = (e) => reject(e);
  });
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SETTINGS HELPERS ---
const getSystemInstruction = (settings?: AppSettings) => {
  let tone = "Professional, objective, and empathetic.";
  let length = "Concise and to the point.";

  if (settings) {
    if (settings.aiTone === 'humorous') tone = "Relaxed, witty, slightly humorous but respectful.";
    if (settings.aiTone === 'scientific') tone = "Strictly scientific, data-driven, academic tone.";
    
    if (settings.aiLength === 'detailed') length = "Detailed, comprehensive explanations.";
    if (settings.aiLength === 'concise') length = "Short, bullet-point style, minimal fluff.";
  }

  return `You are Aesthetica AI, a professional medical aesthetic consultant. ${tone} ${length}`;
};

// --- AESTHETIC DICTIONARY (Expanded) ---
const AESTHETIC_DICT: Record<string, Record<string, string>> = {
  classical: {
    xionghun: "Classical Chinese 'XiongHun' (雄浑). Grand, vigorous, powerful, sublime nature, strong presence, epic lighting.",
    chongdan: "Classical Chinese 'ChongDan' (冲淡). Serene, mild, light, simple, tranquil, minimalist, zen-like, soft natural lighting.",
    dianya: "Classical Chinese 'DianYa' (典雅). Classic elegance, graceful, proper, refined, tasteful, aristocratic but understated.",
    xiannong: "Classical Chinese 'XianNong' (纤秾). Delicate, rich, colorful, lush, detailed texture, exquisite beauty.",
    xilian: "Classical Chinese 'XiLian' (洗炼). Polished, concise, crystalline, sharp, clean-cut, essence-focused.",
    jingjian: "Classical Chinese 'JingJian' (劲健). Sturdy, robust, healthy, energetic, athletic, firm.",
    qili: "Classical Chinese 'QiLi' (绮丽). Beautiful, gorgeous, magnificent, ornate, glowing.",
    ziran: "Classical Chinese 'ZiRan' (自然). Natural, spontaneous, unforced, fresh, organic.",
    hanxu: "Classical Chinese 'HanXu' (含蓄). Implicit, reserved, subtle, deep, mysterious, suggestive.",
    haofang: "Classical Chinese 'HaoFang' (豪放). Unconstrained, bold, open, free-spirited, heroic.",
    chenzhuo: "Classical Chinese 'ChenZhuo' (沉着). Deep, composed, steady, calm, profound, heavy texture, stable composition.",
    gaogu: "Classical Chinese 'GaoGu' (高古). Lofty, ancient, timeless, detached, spiritual, archaic aesthetic.",
    jingshen: "Classical Chinese 'JingShen' (精神). Spirited, vital, sharp, bright, clear, full of life force.",
    zhenmi: "Classical Chinese 'ZhenMi' (缜密). Dense, detailed, meticulous, intricate, fine craftsmanship.",
    shuye: "Classical Chinese 'ShuYe' (疏野). Unrestrained, wild, rustic, open, rough but charming, untamed beauty.",
    qingqi: "Classical Chinese 'QingQi' (清奇). Clear and unusual, strange but pure, unique structure, crisp.",
    weiqu: "Classical Chinese 'WeiQu' (委曲). Winding, subtle, indirect, intricate curves, soft transitions.",
    shijing: "Classical Chinese 'ShiJing' (实境). Concrete, real, tangible, photorealistic, grounded.",
    beikai: "Classical Chinese 'BeiKai' (悲慨). Tragic, generous, emotional, melancholic but grand, dramatic lighting.",
    xingrong: "Classical Chinese 'XingRong' (形容). Form-focused, descriptive, capturing the exact shape and essence.",
    chaoyi: "Classical Chinese 'ChaoYi' (超诣). Transcendent, beyond the mundane, ethereal, spiritual high ground.",
    piaoyi: "Classical Chinese 'PiaoYi' (飘逸). Drifting, elegant, flying, weightless, fairy-like, ethereal movement.",
    kuangda: "Classical Chinese 'KuangDa' (旷达). Broad-minded, open, vast, unrestricted, optimistic.",
    liudong: "Classical Chinese 'LiuDong' (流动). Flowing, dynamic, rhythmic, moving, liquid-like."
  },
  mood: {
    less_tired: "Look Less Tired. Refresh, energetic eyes, reduce dark circles, lifted brow, awake appearance.",
    younger: "Look Younger. Firm skin, voluminous cheeks, reduced nasolabial folds, collagen-rich look.",
    attractive: "Look More Attractive. Enhanced Golden Ratio, magnetic eyes, perfect proportions, increased facial harmony.",
    slimmer: "Look Slimmer. Contoured jawline, defined cheekbones, reduced facial volume, V-shape face.",
    qingleng: "High-cold, aloof, cool tone, distant but attractive, 'QingLeng' vibe, icy beauty.",
    posui: "Fragile beauty, emotional, vulnerable, 'PoSuiGan', glass-like delicacy.",
    songchi: "Relaxed, effortless chic, comfortable, 'SongChiGan', unbothered elegance.",
    zhixing: "Sapiosexual vibe, intelligent, sharp, academic, 'ZhiXingLian', glasses, smart look.",
    sweet: "Sweet, innocent, sugary, 'TianMei', round eyes, soft smile.",
    melancholy: "Melancholic, deep, artistic sadness, 'YouYu', poetic mood."
  },
  status: {
    confident: "State: Confident. Direct gaze, strong chin, posture, assertive lighting, sharp focus.",
    trustworthy: "State: Trustworthy. Soft eyes, genuine micro-smile, open expression, warm lighting, reliable vibe.",
    executive: "State: Executive/Presidential. Powerful, commanded, composed, expensive look, premium quality.",
    mingyuan: "Socialite vibe, expensive, polished, 'MingYuan' style, luxury atmosphere.",
    shujuan: "Bookish, scholarly, gentle, intellectual, 'ShuJuanQi', quiet library vibe.",
    artist: "Artistic, creative, unconventional, expressive, 'YiShuJia', gallery lighting.",
    protagonist: "Main character energy, spotlight, glowing, 'ZhuJueGuangHuan', cinematic center.",
    energetic: "State: Energetic. Dynamic, bright, healthy glow, vitality, sparkling eyes.",
    reliable: "State: Reliable. Solid, grounded, dependable, warm earth tones.",
    wealthy: "State: Old Money. Understated luxury, cashmere textures, quiet confidence, 'LaoQianFeng'."
  },
  tweak: {
    big_eyes: "Feature Tweak: Enlarged Eyes. Doe eyes, bambi eyes, open and bright.",
    high_nose: "Feature Tweak: High Nose Bridge. Refined nasal tip, tall bridge, sculpted nose.",
    small_face: "Feature Tweak: Small Face. Compact facial features, petite bone structure.",
    m_lips: "Feature Tweak: M-shaped Lips. Defined cupid's bow, plump vermilion border.",
    elf_ear: "Feature Tweak: Elf Ears. Slightly protruding upper ears, face appears smaller, fantasy touch.",
    wild_brows: "Feature Tweak: Wild Brows. Natural, feathery, textured eyebrows, defined hair strokes.",
    high_cranial: "Feature Tweak: High Cranial Top. Voluminous hair root, high skull top 'GaoLuDing'.",
    shoulder: "Feature Tweak: Right-angled Shoulder. Defined clavicle, straight shoulder line, elegant posture.",
    plump: "Feature Tweak: Plump/Youthful. Baby fat, rounded features, cute and youthful.",
    sharp_jaw: "Feature Tweak: Razor sharp jawline, defined angles, model look."
  }
};

const FASHION_DICT: Record<string, string> = {
  // Hairstyle
  h_straight: "Hairstyle: Sleek, silky long straight black hair, high shine.",
  h_wavy: "Hairstyle: Voluminous romantic wavy hair, big curls, glamorous.",
  h_french: "Hairstyle: French chic messy bun, effortless, wispy bangs.",
  h_bob: "Hairstyle: Sharp precision bob cut, modern, edgy.",
  h_ponytail: "Hairstyle: High sleek ponytail, snatched look.",
  h_wool: "Hairstyle: Wool roll curls, retro cute, textured volume.",
  h_clavicle: "Hairstyle: Clavicle length hair, airy and light, layered.",
  h_hime: "Hairstyle: Hime cut (Princess cut), blunt sidelocks, anime aesthetic.",
  h_wolf: "Hairstyle: Wolf cut, layers, texture, trendy shaggy look.",
  h_updo: "Hairstyle: Elegant formal updo, clean neck.",
  
  // Headwear
  hw_tiara: "Headwear: Delicate diamond tiara, princess vibe.",
  hw_ribbon: "Headwear: Silk ribbon bow, chanel style black or white.",
  hw_beret: "Headwear: Wool beret, artist vibe, chic.",
  hw_veil: "Headwear: Sheer lace veil, mysterious, bridal aesthetic.",
  hw_hairpin: "Headwear: Traditional jade hairpin (Zan), oriental classical vibe.",
  hw_crown: "Headwear: Gold crown, regal, queen aesthetic.",
  hw_flower: "Headwear: Fresh flower tucked behind ear, nature vibe.",
  hw_band: "Headwear: Wide velvet headband, retro aesthetic.",
  hw_turban: "Headwear: Silk turban, exotic, high fashion.",
  hw_cap: "Headwear: Baseball cap, street style, casual.",

  // Earrings
  e_studs: "Earrings: Simple diamond studs, minimalist class.",
  e_pearl: "Earrings: Classic pearl earrings, elegant.",
  e_hoops: "Earrings: Large gold hoop earrings, bold statement.",
  e_tassel: "Earrings: Long diamond tassel earrings, evening wear.",
  e_vintage: "Earrings: Vintage gold clip-ons, matte finish.",
  e_jade: "Earrings: Green jade drops, oriental elegance.",
  e_cuff: "Earrings: Modern ear cuffs, edgy, silver.",
  e_chandelier: "Earrings: Crystal chandelier earrings, elaborate.",
  e_geometric: "Earrings: Geometric gold shapes, modern art vibe.",
  e_flower: "Earrings: Floral motif earrings, delicate, feminine.",

  // Necklace
  n_choker: "Necklace: Black velvet choker with cameo.",
  n_pearl: "Necklace: Single strand pearl necklace, old money aesthetic.",
  n_diamond: "Necklace: Fine diamond tennis necklace, sparkle.",
  n_gold: "Necklace: Thin gold chain, minimalist.",
  n_pendant: "Necklace: Statement emerald pendant.",
  n_layered: "Necklace: Layered gold chains, bohemian.",
  n_collar: "Necklace: Metal collar necklace, futuristic.",
  n_locket: "Necklace: Vintage locket, sentimental.",

  // Clothing
  c_gown: "Clothing: Haute couture evening gown, silk, expensive fabric.",
  c_suit: "Clothing: Sharp tailored white blazer, power suit, executive look.",
  c_qipao: "Clothing: Modernized Qipao (Cheongsam), silk, oriental patterns.",
  c_shirt: "Clothing: Crisp white oversized shirt, clean aesthetic.",
  c_turtleneck: "Clothing: Black turtleneck, jobs-core, intellectual.",
  c_offshoulder: "Clothing: Off-shoulder top, highlighting clavicles.",
  c_tweed: "Clothing: Chanel-style tweed jacket, classic old money.",
  c_newchinese: "Clothing: New Chinese style, modern cut with traditional elements.",
  c_slip: "Clothing: Silk slip dress, minimal, sultry.",
  c_leather: "Clothing: Black leather jacket, cool, edgy."
};

const BACKGROUND_DICT: Record<string, string> = {
  studio: "Lighting: Professional Studio Lighting. Softbox, Rembrandt lighting, perfectly balanced.",
  natural: "Lighting: Natural Daylight. Soft, diffused, window light, golden hour.",
  cinematic: "Lighting: Cinematic Lighting. Dramatic shadows, teal and orange, moody atmosphere.",
  warm: "Lighting: Warm Tungsten. Cozy, inviting, candle-light vibe.",
  solid: "Background: Solid Color. Clean, minimal, matte finish.",
  indoor: "Background: Luxury Interior. Blurred background of a high-end apartment or hotel.",
  outdoor: "Background: Nature/City. Blurred background of a garden or cityscape.",
  artistic: "Background: Abstract Art. Textured canvas background, artistic brushstrokes."
};

const getIntensityAdverb = (value: number) => {
  if (value < 20) return "a slight hint of";
  if (value < 40) return "a mild touch of";
  if (value < 60) return "a moderate amount of";
  if (value < 80) return "a strong presence of";
  return "an extremely intense, dominant";
};

// --- AI FUNCTIONS ---

export const suggestCreativeOptions = async (
  category: string, 
  existingOptions: string[]
): Promise<{options: OptionItem[], prompts: CustomPrompts}> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
    You are an expert aesthetic consultant. 
    The user is browsing the category "${category}".
    Existing options: ${existingOptions.join(', ')}.
    Generate 4 NEW, CREATIVE, and DISTINCT options.
    Return strict JSON: [{"id": "...", "label": "...", "tip": "...", "prompt": "..."}]
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              tip: { type: Type.STRING },
              prompt: { type: Type.STRING }
            },
            required: ["id", "label", "tip", "prompt"]
          }
        }
      }
    });

    const items = JSON.parse(response.text || "[]");
    const options: OptionItem[] = [];
    const prompts: CustomPrompts = {};

    items.forEach((item: any) => {
      options.push({ id: item.id, label: item.label, tip: item.tip });
      prompts[item.id] = item.prompt;
    });

    return { options, prompts };
  } catch (e) {
    console.error("Creative Suggestion Error", e);
    return { options: [], prompts: {} };
  }
};

export const generateCreativeScenarios = async (): Promise<ScenarioPreset[]> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
    You are a creative aesthetic director. 
    Generate 6 UNIQUE, CREATIVE, and STYLISH aesthetic personas/scenarios for a photo transformation app.
    Examples: "Cyberpunk Rebel", "Forest Fairy", "Vintage 90s HK Star", "Clean Fit CEO".
    
    Return strict JSON: 
    [
      { "id": "unique_id", "name": "Name (Chinese)", "description": "3 keywords description (Chinese)", "icon": "emoji" }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING }
            },
            required: ["id", "name", "description", "icon"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Scenario Gen Error", e);
    return [];
  }
};

export const analyzeFaceMetrics = async (base64Image: string, settings?: AppSettings): Promise<AnalysisResult> => {
  const modelId = "gemini-2.5-flash";
  
  // Optimize input size for analysis
  const optimizedImage = await compressAndResizeImage(base64Image, 1024, 0.7);

  const prompt = `
    Analyze facial aesthetics. Provide professional assessment.
    Return strict JSON:
    {
      "scores": {
        "eyes": 0-100, "cheeks": 0-100, "lips": 0-100, "brows": 0-100, "jawline": 0-100, "symmetry": 0-100, "total": 0-100
      },
      "summary": string (2-sentence summary in Simplified Chinese. Use "照片中人物" instead of "您"),
      "keywords": string[] (8-10 aesthetic keywords in Chinese)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: optimizedImage } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: getSystemInstruction(settings),
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data");
    const result = JSON.parse(text) as AnalysisResult;
    result.timestamp = Date.now();
    return result;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("面部分析失败。");
  }
};

export const generateStyledPortrait = async (
  base64Image: string, 
  view: PortraitView,
  beautyConfig: BeautyConfig,
  styleConfig: StyleConfig,
  fashionConfig?: FashionConfig,
  customPrompts?: CustomPrompts
): Promise<string> => {
  // Using Flash-Image for stability
  const modelId = "gemini-2.5-flash-image"; 
  
  // Optimize input size for generation speed and reliability
  const optimizedImage = await compressAndResizeImage(base64Image, 1024, 0.8);

  let viewPrompt = "";
  if (view === 'front') {
    // ENFORCED ID PHOTO STYLE for Front view
    viewPrompt = "View: Frontal ID Photo style. Subject MUST be facing strictly forward, centered, ears visible, neutral or slight smile. Perfect symmetry.";
  } else if (view === 'side45') {
    // Strengthened 45 degree prompt to prevent "raw output" or laziness
    viewPrompt = "ACTION: ROTATE subject face to a 45-degree oblique angle. GENERATIVE TRANSFORMATION REQUIRED. Do NOT return original image. Highlight jawline.";
  } else if (view === 'side90') {
    viewPrompt = "ACTION: ROTATE subject face to a 90-degree side profile. GENERATIVE TRANSFORMATION REQUIRED. Focus on E-line.";
  }

  const beautyPrompts = [];
  if (beautyConfig.smooth > 0) beautyPrompts.push(`${getIntensityAdverb(beautyConfig.smooth)} skin smoothing`);
  if (beautyConfig.whiten > 0) beautyPrompts.push(`${getIntensityAdverb(beautyConfig.whiten)} skin brightening`);
  if (beautyConfig.highClass > 0) beautyPrompts.push(`${getIntensityAdverb(beautyConfig.highClass)} 'High Class' (GaoJiGan) vibe`);
  if (beautyConfig.rich > 0) beautyPrompts.push(`${getIntensityAdverb(beautyConfig.rich)} 'Wealthy' (FuGuiGan) vibe`);
  if (beautyConfig.pure > 0) beautyPrompts.push(`${getIntensityAdverb(beautyConfig.pure)} 'Pure/Innocent' (QuFengChen) vibe`);
  if (beautyConfig.darkCircles > 0) beautyPrompts.push(`${getIntensityAdverb(beautyConfig.darkCircles)} remove dark circles under eyes`);
  if (beautyConfig.nasolabial > 0) beautyPrompts.push(`${getIntensityAdverb(beautyConfig.nasolabial)} reduce nasolabial folds`);
  if (beautyConfig.jawline > 0) beautyPrompts.push(`${getIntensityAdverb(beautyConfig.jawline)} sharpen jawline definition`);
  
  const beautyPromptCombined = beautyPrompts.length > 0 ? "Beautification: " + beautyPrompts.join(", ") + "." : "";

  let stylePrompt = "Style: Clinical Standard.";
  if (styleConfig.category !== 'clinical') {
     const sub = styleConfig.subOption;
     if (customPrompts && customPrompts[sub]) {
       stylePrompt = `Style: ${customPrompts[sub]}. Intensity: ${getIntensityAdverb(styleConfig.intensity)}.`;
     } else {
        const dictEntry = AESTHETIC_DICT[styleConfig.category]?.[sub];
        if (dictEntry) {
            stylePrompt = `Style: ${dictEntry} Intensity: ${getIntensityAdverb(styleConfig.intensity)}.`;
        }
     }
  }

  const fashionPrompts = [];
  if (fashionConfig) {
    Object.entries(fashionConfig).forEach(([key, value]) => {
      if (!value) return;
      if (customPrompts && customPrompts[value]) {
         fashionPrompts.push(`Fashion (${key}): ${customPrompts[value]}`);
      } else if (FASHION_DICT[value]) {
         fashionPrompts.push(FASHION_DICT[value]);
      }
    });
  }
  const fashionPromptCombined = fashionPrompts.length > 0 ? "Fashion: " + fashionPrompts.join(". ") : "";

  // FORCE ID PHOTO BACKGROUND for Front view
  let backgroundPrompt = "";
  if (view === 'front') {
     backgroundPrompt = "BACKGROUND: SOLID WHITE OR LIGHT GREY. STUDIO LIGHTING.";
  }

  const prompt = `
    Portrait Task.
    1. CROP: Head, Neck, Upper Chest. Center face.
    2. ASPECT: 1:1.
    3. ${viewPrompt}
    4. ${beautyPromptCombined}
    5. ${stylePrompt}
    6. ${fashionPromptCombined}
    7. ${backgroundPrompt}
    8. QUALITY: Photorealistic, 8k.
    9. CLEAN: No text/lines.
    10. INSTRUCTION: Completely regenerate the portrait based on the prompt. Do NOT simply copy the original.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: optimizedImage } },
          { text: prompt },
        ],
      },
    });

    // Handle potential mixed content (text preamble + image)
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
       for (const part of parts) {
          if (part.inlineData?.data) return part.inlineData.data;
       }
    }
    throw new Error("No image generated.");
  } catch (error: any) {
    console.error("Image Gen Error:", error);
    if (JSON.stringify(error).includes("403")) throw new Error("API 权限受限 (403)。");
    throw new Error(`无法生成${view}视图。`);
  }
};

export const generateAnnotatedImage = async (base64CleanImage: string, view: PortraitView, scores?: any): Promise<string> => {
  const modelId = "gemini-2.5-flash-image";
  // Annotated image relies on the already generated clean image, which is usually reasonable size.
  // But we can double check logic in App.tsx
  
  let labelsPrompt = view === 'front' ? "Labels: Horizontal lines for Symmetry, Vertical center line." : "Labels: E-Line, Frankfort Plane.";
  const prompt = `
    Aesthetic Geometry Analysis.
    Input: Photo.
    Task: Draw minimal white geometric lines OVER the image to show facial proportions.
    
    CRITICAL RULES:
    1. STRICTLY NO DIMMING. NO DARK OVERLAY. NO BACKGROUND CHANGE.
    2. The image MUST remain as bright as the original.
    3. Draw thin white lines only.
    4. Add small English labels: Aesthetic Geometry, ${labelsPrompt}
    5. ${scores ? `Add text: Eyes ${scores.eyes}%, Total ${scores.total}%` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ inlineData: { mimeType: "image/jpeg", data: cleanBase64(base64CleanImage) } }, { text: prompt }] },
    });
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
       for (const part of parts) {
          if (part.inlineData?.data) return part.inlineData.data;
       }
    }
    return "";
  } catch (error) { throw new Error("无法生成美学标注。"); }
};

export const explainSelection = async (text: string, settings?: AppSettings): Promise<string> => {
   const modelId = "gemini-2.5-flash";
   try {
      const response = await ai.models.generateContent({
         model: modelId,
         contents: { text: `Explain this medical/aesthetic term briefly: "${text}".` },
         config: { systemInstruction: getSystemInstruction(settings) }
      });
      return response.text || "无法解释。";
   } catch(e) { return "解释失败。"; }
};

export const generateChatResponse = async (
  history: { role: 'user' | 'model'; text: string }[],
  currentMessage: string,
  settings?: AppSettings
): Promise<{ text: string; suggestedQuestions: string[] }> => {
  const modelId = "gemini-2.5-flash";
  const sdkHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  const chat = ai.chats.create({
    model: modelId,
    history: sdkHistory,
    config: {
      systemInstruction: getSystemInstruction(settings) + " Keep the response concise and friendly. Return the response in JSON format with fields: 'response' (the answer string) and 'suggested_questions' (array of 3 follow-up questions).",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            response: { type: Type.STRING },
            suggested_questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  try {
    const result = await chat.sendMessage({ message: currentMessage });
    const json = JSON.parse(result.text || "{}");
    return {
      text: json.response || "思考中...",
      suggestedQuestions: json.suggested_questions || []
    };
  } catch (e) {
    console.error("Chat Error", e);
    return { text: "抱歉，我遇到了一点问题。", suggestedQuestions: [] };
  }
};

export const generateScenario = async (scenario: string): Promise<{
  beauty: BeautyConfig;
  style: StyleConfig;
  fashion: FashionConfig;
  background: BackgroundConfig;
}> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
    You are an expert aesthetic consultant.
    Generate a complete aesthetic configuration for the persona/scenario: "${scenario}".
    
    Return strict JSON with the following structure:
    {
      "beauty": { "smooth": 0-100, "whiten": 0-100, "highClass": 0-100, "rich": 0-100, "pure": 0-100, "darkCircles": 0-100, "nasolabial": 0-100, "jawline": 0-100 },
      "style": { "category": "one of [clinical, classical, mood, status, tweak]", "subOption": "string_id", "intensity": 0-100 },
      "fashion": { "hairstyle": "string_id", "headwear": "string_id", "earrings": "string_id", "necklace": "string_id", "clothing": "string_id" },
      "background": { "lighting": "string_id", "environment": "string_id" }
    }
    
    For "fashion" and "style.subOption", try to use IDs that match common keys if possible (e.g. h_straight, classical_xionghun), otherwise use descriptive keys.
    For "background.lighting", use one of: studio, natural, cinematic, warm.
    For "background.environment", use one of: solid, indoor, outdoor, artistic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             beauty: {
                type: Type.OBJECT,
                properties: {
                   smooth: {type: Type.INTEGER}, whiten: {type: Type.INTEGER}, highClass: {type: Type.INTEGER},
                   rich: {type: Type.INTEGER}, pure: {type: Type.INTEGER}, darkCircles: {type: Type.INTEGER},
                   nasolabial: {type: Type.INTEGER}, jawline: {type: Type.INTEGER}
                }
             },
             style: {
                type: Type.OBJECT,
                properties: {
                   category: {type: Type.STRING, enum: ['clinical', 'classical', 'mood', 'status', 'tweak']},
                   subOption: {type: Type.STRING},
                   intensity: {type: Type.INTEGER}
                }
             },
             fashion: {
                type: Type.OBJECT,
                properties: {
                   hairstyle: {type: Type.STRING}, headwear: {type: Type.STRING}, earrings: {type: Type.STRING},
                   necklace: {type: Type.STRING}, clothing: {type: Type.STRING}
                }
             },
             background: {
                type: Type.OBJECT,
                properties: {
                   lighting: {type: Type.STRING}, environment: {type: Type.STRING}
                }
             }
          }
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    // Fallback defaults if parsing fails or partial data
    return {
       beauty: { smooth: 50, whiten: 30, ...result.beauty },
       style: { category: 'clinical', subOption: 'standard', intensity: 50, ...result.style },
       fashion: { ...result.fashion },
       background: { lighting: 'studio', environment: 'solid', ...result.background }
    };
  } catch (e) {
    console.error("Scenario Error", e);
    // Return safe default
    return {
        beauty: { smooth: 50, whiten: 30, highClass: 0, rich: 0, pure: 0, darkCircles: 0, nasolabial: 0, jawline: 0 },
        style: { category: 'clinical', subOption: 'standard', intensity: 50 },
        fashion: {},
        background: { lighting: 'studio', environment: 'solid' }
    };
  }
};
