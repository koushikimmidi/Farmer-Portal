import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AdvisoryInput, AdvisoryResponse } from "../types";

// Initialize Gemini
// NOTE: The prompt instructions explicitly say process.env.API_KEY is injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const advisorySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A 2-sentence summary of the outlook." },
    sowingAdvice: { type: Type.STRING, description: "Specific advice on sowing depth, spacing, and seed treatment." },
    fertilizerSchedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stage: { type: Type.STRING, description: "Growth stage (e.g., Basal, Vegetative)" },
          recommendation: { type: Type.STRING, description: "Specific fertilizer and quantity per acre." }
        }
      }
    },
    irrigationPlan: { type: Type.STRING, description: "Frequency and method advice based on soil." },
    pestManagement: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          alertLevel: { type: Type.STRING, enum: ["Green", "Yellow", "Red"] },
          pestName: { type: Type.STRING },
          action: { type: Type.STRING, description: "Organic or chemical remedy." }
        }
      }
    },
    sustainabilityTip: { type: Type.STRING, description: "One tip for water conservation or soil health." }
  }
};

export const getFarmingAdvisory = async (input: AdvisoryInput, language: string = 'English'): Promise<AdvisoryResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }

  const prompt = `
    Act as an expert agricultural scientist for India (Smart India Hackathon Context).
    Provide a detailed farming advisory for the following conditions:
    Crop: ${input.crop}
    Soil Type: ${input.soilType}
    Sowing Date: ${input.sowingDate}
    Land Area: ${input.landArea} acres
    Irrigation: ${input.irrigationType}

    Consider current general climate trends in India. 
    Focus on increasing yield, reducing chemical usage, and water conservation.

    IMPORTANT: Output Language must be: ${language}. 
    However, the JSON KEYS (e.g., "summary", "sowingAdvice", "fertilizerSchedule") MUST remain in English. 
    Only translate the VALUES (the content strings) into ${language}.

    Return the data strictly in JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: advisorySchema,
        systemInstruction: `You are Krishi Sahayak, an expert Indian agriculture AI. Provide answers in ${language}.`
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AdvisoryResponse;
  } catch (error) {
    console.error("Advisory Error:", error);
    throw error;
  }
};

export const chatWithAssistant = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: API Key is missing. Please check configuration.";
  }

  try {
    // Convert history to Gemini format if needed, but for simple chat create, we usually maintain state in the component
    // and pass context. For simplicity here, we'll just send the message to a fresh chat or handle history in the component.
    // Here we will use a single turn for simplicity or a chat session if we passed the object.
    
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: model,
      contents: message,
      config: {
        systemInstruction: "You are a helpful farming assistant named 'Krishi Sahayak'. You help Indian farmers with queries about crops, weather, schemes (PM-Kisan), and market prices. Keep answers concise and encouraging."
      }
    });

    return response.text || "I could not generate a response at this time.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I am having trouble connecting to the server right now.";
  }
};