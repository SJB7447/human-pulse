import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const FREE_TIER_SAVE_LIMIT = 5;

export async function POST(req: NextRequest) {
    try {
        const reqBody = await req.json();
        const { articleId, emotion, userOpinion } = reqBody;

        if (!articleId || !emotion) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // 1. Check Subscription Status
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status')
            .eq('id', user.id)
            .single();

        const isPremium = profile?.subscription_status === 'active';

        // 2. Check Save Count if NOT Premium
        if (!isPremium) {
            const { count, error: countError } = await supabase
                .from('interactions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .not('article_id', 'is', null)
                .eq('interaction_type', 'story_saved');

            if (countError) {
                console.error('Count error:', countError);
                return NextResponse.json({ error: 'Failed to verify limits' }, { status: 500 });
            }

            if ((count || 0) >= FREE_TIER_SAVE_LIMIT) {
                return NextResponse.json({
                    error: 'Free limit reached. Upgrade to Premium for unlimited saves.',
                    isLimitReached: true,
                    limit: FREE_TIER_SAVE_LIMIT
                }, { status: 403 });
            }
        }

        // 3. Save Story
        const { error: saveError } = await supabase.from('interactions').insert({
            user_id: user.id,
            article_id: articleId,
            emotion_log: emotion,
            interaction_type: 'story_saved',
            user_opinion: userOpinion || null,
            is_public: reqBody.isPublic ?? true, // Default to true if missing
        });

        if (saveError) {
            console.error('Save error:', saveError);
            return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
        }

        return NextResponse.json({ success: true, saved: true });

    } catch (error: any) {
        console.error('Save API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
