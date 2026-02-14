
import { GoogleGenAI } from "@google/genai";

export async function generateFlyerBackground(theme: string): Promise<string | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing from the environment.");
  }

  try {
    // Guidelines: Create new instance right before making an API call
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Abstract artistic background for Toastmasters. Theme: "${theme}". 
    Colors: Loyal Blue (#004165), True Maroon (#772432). 
    Minimalist leadership aesthetics. Professional, blurred depth. No text. 
    Design for a vertical flyer background.`;

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
    throw new Error("API Key is missing.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Close-up professional headshot of a person for Toastmasters role: "${role}". 
    Elegant lighting, clean background, center aligned. Professional business attire.`;

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
