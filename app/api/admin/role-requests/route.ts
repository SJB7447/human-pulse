import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Admin fetches all role requests
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

        // Check admin role
        if (user.user_metadata?.role !== 'admin') {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('role_requests')
            .select('*, profiles:user_id(username, full_name)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ requests: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Admin approves or rejects a role request
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

        if (user.user_metadata?.role !== 'admin') {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const { requestId, action } = await req.json();

        if (!requestId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 });
        }

        // Get the request details
        const { data: roleRequest, error: fetchError } = await supabase
            .from('role_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError || !roleRequest) {
            return NextResponse.json({ error: '요청을 찾을 수 없습니다.' }, { status: 404 });
        }

        // Update request status
        const { error: updateError } = await supabase
            .from('role_requests')
            .update({
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', requestId);

        if (updateError) throw updateError;

        // If approved, update the user's role in profiles and auth metadata
        if (action === 'approve') {
            // Update profiles table
            await supabase
                .from('profiles')
                .update({ role: roleRequest.requested_role })
                .eq('id', roleRequest.user_id);

            // Update auth user metadata via admin API
            const { error: authError } = await supabase.auth.admin.updateUserById(
                roleRequest.user_id,
                { user_metadata: { role: roleRequest.requested_role } }
            );

            if (authError) {
                console.error('Auth metadata update error:', authError);
                // Fallback: just keep profiles table updated
            }
        }

        return NextResponse.json({ success: true, action });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
