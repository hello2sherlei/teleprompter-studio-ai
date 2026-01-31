import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from '../types';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("Gemini API Key is missing. AI features will not work.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const rewriteScript = async (text: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "API Key missing. Please configure.";

    try {
        const response = await ai.models.generateContent({
            model: GeminiModel.FLASH,
            contents: `Rewrite the following teleprompter script for better flow and clarity, suitable for a video presentation. Keep the tone conversational. \n\nScript:\n${text}`,
        });
        return response.text || text;
    } catch (error) {
        console.error("Gemini Rewrite Error:", error);
        return "Error generating content. Please try again.";
    }
};

export const expandScript = async (text: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "API Key missing. Please configure.";

    try {
        const response = await ai.models.generateContent({
            model: GeminiModel.FLASH,
            contents: `Expand the following teleprompter script introduction into a full section, adding 2-3 detailed paragraphs while maintaining the original tone. \n\nScript:\n${text}`,
        });
        return response.text || text;
    } catch (error) {
        console.error("Gemini Expand Error:", error);
        return "Error generating content. Please try again.";
    }
};