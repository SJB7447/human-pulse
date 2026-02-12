import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Lazy initialization — don't throw at import time to avoid crashing server components
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Text model (keyword search, article drafting, spell-check, analysis)
export const model = genAI?.getGenerativeModel({ model: "gemini-3-flash" }) ?? null;

// Image generation model (native Gemini image gen)
export const imageModel = genAI?.getGenerativeModel({ model: "gemini-3-pro-image-preview" }) ?? null;
