
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API client following strict guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIGuidance = async (message: string, history: {role: 'user' | 'model', text: string}[], preferredLanguage: string = 'English') => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are 'CivicGuide', the advanced AI assistant for CivicFlow, powered by Gemini 3. 
    Your goal is to help citizens report municipal issues.
    
    SPECIAL LANGUAGE INSTRUCTIONS:
    - You must support English, Hindi, Tamil, Malayalam, Telugu, Bengali, and Punjabi.
    - The user's preferred language is: ${preferredLanguage}.
    - Always respond in the language the user is using or their preferred language.
    - Be culturally aware and use appropriate honorifics for the region.

    CORE GOALS:
    - Help users report potholes, broken lights, and illegal dumping.
    - Be friendly, futuristic, and extremely efficient.
    - Help users identify which category their issue belongs to.
    - Summarize descriptions for formal work orders.
    - Remind users the target resolution time is under 7 days.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction,
      temperature: 0.8,
      topP: 0.95,
    },
  });

  return response.text || "I'm having a brief connection surge. Please try again, I am here to help!";
};

export const analyzeIssueImage = async (base64Image: string) => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Analyze this image. What kind of public works issue is this? (Pothole, Streetlight, Illegal Dumping, Water Leak, or Other). Provide a brief 1-sentence description and categorize it." }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: ['Pothole', 'Streetlight', 'Illegal Dumping', 'Water Leak', 'Other'] },
          description: { type: Type.STRING }
        },
        required: ['category', 'description']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Generates an image for a civic report using Gemini 2.5 Flash Image (Nano Banana)
 */
export const generateReportImage = async (category: string, description: string) => {
  const model = 'gemini-2.5-flash-image';
  const prompt = `A realistic high-quality photo of a municipal infrastructure issue: ${category}. ${description}. Cinematic lighting, urban setting, real-world detail.`;
  
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};
