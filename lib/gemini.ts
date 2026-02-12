import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("Missing Gemini API key");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Text model (keyword search, article drafting, spell-check, analysis)
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Image generation model (native Gemini image gen)
export const imageModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-preview-image-generation" });
