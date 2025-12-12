import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, AnalysisResult, OptionItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export const generateChatResponse = async (
  history: { role: string; text: string }[],
  message: string,
  settings: AppSettings
): Promise<{ text: string; suggestedQuestions: string[] }> => {
  try {
     const historyContent = history.map(h => ({
         role: h.role,
         parts: [{ text: h.text }]
     }));

     const chat = ai.chats.create({
        model: MODEL_NAME,
        history: historyContent,
        config: {
            systemInstruction: `You are a professional aesthetic consultant. Tone: ${settings.aiTone}. Length: ${settings.aiLength}.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        }
     });

     const result = await chat.sendMessage({ message });
     const json = JSON.parse(result.text);
     return {
         text: json.text,
         suggestedQuestions: json.suggestedQuestions || []
     };
  } catch (error) {
      console.error("Chat Error", error);
      return { text: "抱歉，网络连接似乎有点问题，请稍后再试。", suggestedQuestions: [] };
  }
};

export const analyzeFace = async (imageBase64: string): Promise<AnalysisResult> => {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Analyze this face for aesthetic proportions based on standard beauty criteria.
    Provide scores (0-100) for eyes, cheeks, lips, brows, jawline, symmetry, and a total score.
    Provide a professional summary (in Chinese).
    Provide 5-8 aesthetic keywords (in Chinese).`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Data } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scores: {
                            type: Type.OBJECT,
                            properties: {
                                eyes: { type: Type.NUMBER },
                                cheeks: { type: Type.NUMBER },
                                lips: { type: Type.NUMBER },
                                brows: { type: Type.NUMBER },
                                jawline: { type: Type.NUMBER },
                                symmetry: { type: Type.NUMBER },
                                total: { type: Type.NUMBER }
                            }
                        },
                        summary: { type: Type.STRING },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });

        return JSON.parse(response.text) as AnalysisResult;
    } catch (e) {
        console.error(e);
        throw new Error("Analysis failed");
    }
};

export const getDynamicOptions = async (category: string, type: 'style' | 'fashion'): Promise<OptionItem[]> => {
    const prompt = `Generate 4 distinct and trendy ${type} options for category '${category}'. 
    Return JSON array. Each item has id, label (Chinese), and tip (short description in Chinese).`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            label: { type: Type.STRING },
                            tip: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text) as OptionItem[];
    } catch (e) {
        console.error(e);
        return [];
    }
};
