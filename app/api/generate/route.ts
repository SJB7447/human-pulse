import { genAI, TEXT_MODEL_NAME, extractText } from '@/lib/gemini';
import { STORY_GENERATION_PROMPT } from '@/lib/prompts';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const DAILY_FREE_LIMIT = 3;

export async function POST(req: NextRequest) {
    try {
        if (!genAI) return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // 1. Check Subscription Status & Usage
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status')
            .eq('id', user.id)
            .single();

        const isPremium = profile?.subscription_status === 'active';

        if (!isPremium) {
            // Get start of today (UTC)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count, error: countError } = await supabase
                .from('interactions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('interaction_type', 'story_generated')
                .gte('created_at', today.toISOString());

            if (countError) {
                console.error('Usage Check Error:', countError);
                return NextResponse.json({ error: 'Failed to verify usage limits' }, { status: 500 });
            }

            if ((count || 0) >= DAILY_FREE_LIMIT) {
                return NextResponse.json({
                    error: 'Daily story limit reached',
                    isLimitReached: true,
                    limit: DAILY_FREE_LIMIT
                }, { status: 403 });
            }
        }

        const prompt = `${STORY_GENERATION_PROMPT}\n\nArticle Content:\n${content}\n\nIMPORTANT: You must respond in Korean (한국어) for "title", "summary", "text", "question", and "options". However, the "visual_description" field MUST remain in English for image generation purposes.`;

        const result = await genAI.models.generateContent({ model: TEXT_MODEL_NAME, contents: prompt });
        const text = extractText(result);

        // Clean up markdown code blocks if Gemini includes them
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(cleanText);

            // 2. Record Usage
            const { error: logError } = await supabase.from('interactions').insert({
                user_id: user.id,
                article_id: null,
                interaction_type: 'story_generated',
                emotion_log: jsonResponse.emotion || null
            });

            if (logError) {
                console.error('Failed to log interaction:', logError);
            }

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
