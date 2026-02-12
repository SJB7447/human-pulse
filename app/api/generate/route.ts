import { model } from '@/lib/gemini';
import { STORY_GENERATION_PROMPT } from '@/lib/prompts';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const DAILY_FREE_LIMIT = 3;

export async function POST(req: NextRequest) {
    try {
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
                // Fail open or closed? Let's fail closed for safety but log it.
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if Gemini includes them
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(cleanText);

            // 2. Record Usage
            // We do this AFTER successful generation to not count failed attempts
            const { error: logError } = await supabase.from('interactions').insert({
                user_id: user.id,
                article_id: null, // We might not have article_id passed in explicitly? 
                // Ah, interaction table expects article_id usually. 
                // Checks schema: article_id uuid references public.articles(id).
                // If specific article context is needed, we should pass articleId in request.
                // For now, let's leave it null if the schema allows nullable, or we need to pass it.
                // Schema: article_id uuid references public.articles(id)
                // It is NOT marked NOT NULL in the schema I read earlier?
                // Let's check schema.sql again.
                // "article_id uuid references public.articles(id)," -> It is nullable by default unless "not null" specified.
                interaction_type: 'story_generated',
                emotion_log: jsonResponse.emotion || null
            });

            // Note: If article_id is strictly required by some FK constraint logic not visible, we might error.
            // But standard SQL allows null FK unless NO NULL.
            // Ideally we should pass articleId from client to associate properly.

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
