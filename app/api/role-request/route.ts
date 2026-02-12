import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch user's own role requests
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

        const { data, error } = await supabase
            .from('role_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ requests: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new role request
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

        const { role, reason } = await req.json();

        if (!role || !['reporter', 'admin'].includes(role)) {
            return NextResponse.json({ error: '유효하지 않은 역할입니다.' }, { status: 400 });
        }

        // Check for existing pending request
        const { data: existing } = await supabase
            .from('role_requests')
            .select('id')
            .eq('user_id', user.id)
            .eq('requested_role', role)
            .eq('status', 'pending')
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ error: '이미 대기 중인 요청이 있습니다.' }, { status: 409 });
        }

        const { data, error } = await supabase
            .from('role_requests')
            .insert({
                user_id: user.id,
                requested_role: role,
                reason: reason || null,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ request: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
