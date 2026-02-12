import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Lazy initialization — don't throw at import time to avoid crashing server components
export const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Models
// NOTE: User requested gemini-3-flash, but it requires v1alpha/unreleased API. Falling back to gemini-2.0-flash.
export const TEXT_MODEL_NAME = "gemini-2.0-flash";
export const IMAGE_MODEL_NAME = "imagen-3.0-generate-001";

// Helper to extract text from response
export const extractText = (response: any) => {
    if (response?.text && typeof response.text === 'function') return response.text();
    if (response?.text && typeof response.text === 'string') return response.text;
    return response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
};
