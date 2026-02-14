
import { GoogleGenAI } from "@google/genai";

export async function generateFlyerBackground(theme: string): Promise<string | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is missing from the environment. Please ensure you have selected a project with billing enabled.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Abstract minimalist high-resolution professional background for Toastmasters meeting. Theme: "${theme}". 
    Incorporate brand colors: Loyal Blue (#004165) and True Maroon (#772432). 
    Leadership, growth, and communication aesthetics. Vertical layout. No text or people. 
    Professional lighting, elegant depth of field.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Flyer BG generation error:", error);
    throw error;
  }
}

export async function generateRoleAvatar(role: string, theme: string): Promise<string | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is missing.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Professional profile headshot for Toastmasters role: "${role}". 
    Corporate professional attire, centered framing, high-quality lighting, soft blurred background. 
    Professional communication context.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Avatar generation error:", error);
    throw error;
  }
}
