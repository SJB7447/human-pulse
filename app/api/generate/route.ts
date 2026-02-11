import { model } from '@/lib/gemini';
import { STORY_GENERATION_PROMPT } from '@/lib/prompts';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const prompt = `${STORY_GENERATION_PROMPT}\n\nArticle Content:\n${content}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if Gemini includes them
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(cleanText);
            return NextResponse.json(jsonResponse);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 });
        }

    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
