import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { paymentKey, orderId, amount } = await req.json();

    console.log('Verifying payment:', { paymentKey, orderId, amount });

    let tossResponseData: any = {};

    try {
        // 0. Authenticate User
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        // 1. Verify Payment
        if (paymentKey.startsWith('DEMO_KEY_')) {
            // DEMO MODE: Simulate successful verification
            console.log(`[DEMO PAYMENT] Processing demo payment. OrderID: ${orderId}, Amount: ${amount}`);

            tossResponseData = {
                mId: 'demo_merchant_id',
                version: 'v1',
                paymentKey: paymentKey,
                orderId: orderId,
                orderName: 'Demo Premium Subscription',
                currency: 'KRW',
                method: '카드',
                totalAmount: amount,
                balanceAmount: amount,
                status: 'DONE',
                requestedAt: new Date().toISOString(),
                approvedAt: new Date().toISOString(),
                card: {
                    number: '0000-0000-0000-0000',
                    amount: amount,
                    cardType: '신용',
                    ownerType: '개인',
                    acquireStatus: 'READY',
                },
                type: 'NORMAL',
            };
        } else {
            // REAL MODE: Verify with Toss Payments API
            const widgetSecretKey = process.env.TOSS_SECRET_KEY;

            if (!widgetSecretKey) {
                console.error('Missing TOSS_SECRET_KEY');
                return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
            }

            const encryptedSecretKey = 'Basic ' + Buffer.from(widgetSecretKey + ':').toString('base64');

            const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
                method: 'POST',
                headers: {
                    Authorization: encryptedSecretKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    amount,
                    paymentKey,
                }),
            });

            tossResponseData = await response.json();

            if (!response.ok) {
                console.error('Toss API Error:', tossResponseData);
                return NextResponse.json({ error: tossResponseData.message || 'Payment verification failed' }, { status: response.status });
            }
        }

        // 2. Transact: Save Order & Update Subscription
        // Note: Ideally this should be a transaction or use a Service Role client to bypass RLS.
        // Current implementation relies on the user's session permission to insert their own order
        // and update their own profile.

        // Insert Order
        const { error: orderError } = await supabase.from('orders').insert({
            user_id: user.id,
            order_id: orderId,
            payment_key: paymentKey,
            amount: amount,
            status: 'completed',
        });

        if (orderError) {
            console.error('Order Insert Error:', orderError);
            // We continue even if order logging fails, as payment was confirmed.
            // In a strict system, we might want to fail or rollback, but for MVP we prioritize the subscription activation.
        }

        // Update Profile Subscription
        const { error: profileError } = await supabase.from('profiles').update({
            subscription_status: 'active',
            subscription_plan: 'premium',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 Days
        }).eq('id', user.id);

        if (profileError) {
            console.error('Profile Update Error:', profileError);
            return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: tossResponseData });

    } catch (error: any) {
        console.error('Payment Confirmation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
