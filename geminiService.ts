
import { GoogleGenAI } from "@google/genai";

export async function generateFlyerBackground(theme: string): Promise<string | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is missing. Please select a project with billing enabled to use this feature.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Abstract minimalist high-resolution professional background for Toastmasters meeting. Theme: "${theme}". 
    Corporate brand aesthetic: Loyal Blue (#004165) and True Maroon (#772432). 
    Communication and leadership vibes. Vertical layout. No text, no people.`;

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
    Corporate attire, centered framing, professional studio lighting, blurred background.`;

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
