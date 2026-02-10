
import { GoogleGenAI } from "@google/genai";

export async function generateFlyerBackground(theme: string): Promise<string | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please ensure process.env.API_KEY is configured.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Create a professional, modern, and high-quality background for a Toastmasters International meeting flyer. 
    The meeting theme is "${theme}". 
    The design MUST use the official Toastmasters color palette: 
    - Loyal Blue (#004165)
    - True Maroon (#772432)
    - Happy Yellow (#F2DF74)
    - Cool Grey (#A9B2B1)
    
    The style should be corporate yet inspiring, abstract with clean lines. 
    Ensure a large portion of the image is subtle or has dark space (especially using Loyal Blue or True Maroon) to allow for legible white text overlays. 
    Avoid people in the image; focus on abstract shapes, light flares, or symbolic representations of communication and leadership.`;

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
    if (!candidate || !candidate.content || !candidate.content.parts) {
      console.warn("No image parts found in the Gemini response.");
      return null;
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating background:", error);
    return null;
  }
}

export async function generateRoleAvatar(role: string, theme: string): Promise<string | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key is missing.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `A professional, corporate headshot of a person representing the Toastmasters role: "${role}". 
    Theme: "${theme}". 
    High-quality studio lighting, professional attire, clean blurred background. 
    Friendly and confident expression. Center headshot, 1:1 aspect ratio.`;

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
    if (!candidate || !candidate.content || !candidate.content.parts) return null;

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating avatar:", error);
    return null;
  }
}
