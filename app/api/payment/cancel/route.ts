import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In a real app, call Toss Payments API to cancel automatic billing here.
        // For MVP/Demo, we just update the DB status.

        const { error } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'canceled',
                subscription_plan: 'free',
                // Keep period_end for reference or clear it depending on policy
            })
            .eq('id', user.id);

        if (error) throw error;

        // Optionally log a cancellation order/event
        await supabase.from('orders').insert({
            user_id: user.id,
            order_id: `CANCEL-${Date.now()}`,
            amount: 0,
            status: 'canceled',
            payment_key: 'N/A'
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Cancellation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
