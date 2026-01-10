import { GoogleGenAI } from "@google/genai";
import { Pattern } from "../types";

export const suggestNextRow = async (pattern: Pattern): Promise<string> => {
  // Fix: Instantiate GoogleGenAI inside the function to ensure the most up-to-date API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    I am writing a crochet pattern in ${pattern.mode} mode.
    The current pattern state is:
    ${JSON.stringify(pattern.rows.map(r => r.stitches.map(s => s.type)))}

    Suggest the logical next row or round for this pattern. 
    Return only a short string of crochet instructions (e.g., "Row 5: sc in each st around" or "Row 3: *sc, inc* repeat 6 times").
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Continue working even rows.";
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return "Keep going with your creative flow!";
  }
};