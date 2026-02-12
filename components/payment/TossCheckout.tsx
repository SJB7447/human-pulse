'use client';

import { useState } from 'react';
import { initializeTossPayments } from '@/lib/toss-payments';
import { useToast } from '@/components/ui/Toast';

interface TossCheckoutProps {
    amount: number;
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail?: string;
    successUrl?: string;
    failUrl?: string;
}

export default function TossCheckout({
    amount,
    orderId,
    orderName,
    customerName,
    customerEmail,
    successUrl,
    failUrl
}: TossCheckoutProps) {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const isDemoMode = !process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    const handlePayment = async () => {
        setLoading(true);
        try {
            const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

            // DEMO MODE: If no key is provided, simulate success for presentation
            if (!clientKey) {
                showToast('Demonstration Mode: Simulating successful payment...', 'success');
                setTimeout(() => {
                    const targetUrl = successUrl || `${window.location.origin}/payment/success?orderId=${orderId}&paymentKey=DEMO_KEY_${Date.now()}&amount=${amount}`;
                    window.location.href = targetUrl;
                }, 1500);
                return;
            }

            const tossPayments = await initializeTossPayments();

            await tossPayments.requestPayment('카드', {
                amount,
                orderId,
                orderName,
                customerName,
                customerEmail,
                successUrl: successUrl || `${window.location.origin}/payment/success`, // Fixed URL to match page structure
                failUrl: failUrl || `${window.location.origin}/payment/fail`,
            });
        } catch (error: any) {
            console.error(error);
            showToast('Payment initialization failed: ' + error.message, 'error');
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {isDemoMode && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-700 text-sm animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Demo Mode Active:</strong> Payment will be simulated without actual processing.</span>
                </div>
            )}
            <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 ${isDemoMode
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
            >
                {loading
                    ? '처리 중...'
                    : isDemoMode
                        ? `(Demo) 월 ${amount.toLocaleString()}원 결제 시뮬레이션`
                        : `월 ${amount.toLocaleString()}원으로 구독하기`
                }
            </button>
        </div>
    );
}
