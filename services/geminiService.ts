import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedMetadata } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImageForPromo = async (base64Image: string): Promise<GeneratedMetadata> => {
  // Strip the prefix if present (e.g. "data:image/png;base64,")
  const base64Data = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Data,
            },
          },
          {
            text: "Analyze this UI screenshot. Suggest a catchy marketing title (max 5 words), a descriptive subtitle (max 10 words), and identify two dominant or complementary hex colors from the image that would look good as a background gradient.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            primaryColor: { type: Type.STRING, description: "Hex color code" },
            secondaryColor: { type: Type.STRING, description: "Hex color code" },
          },
          required: ["title", "subtitle", "primaryColor", "secondaryColor"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from Gemini");

    return JSON.parse(jsonText) as GeneratedMetadata;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    // Fallback if API fails
    return {
      title: "New Feature Launch",
      subtitle: "Experience the next evolution of design",
      primaryColor: "#0f172a",
      secondaryColor: "#334155",
    };
  }
};