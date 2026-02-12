'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Suspense } from 'react';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('결제 정보를 확인하고 있습니다...');

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    useEffect(() => {
        if (!paymentKey || !orderId || !amount) {
            // We might want to allow empty params if just testing the UI, but generally this is an error state
            // or we just show a loader until params might appear (unlikely).
            // Better: if no params, just return or show error.
            setStatus('error');
            setMessage('결제 정보가 누락되었습니다.');
            return;
        }

        const verifyPayment = async () => {
            try {
                // Unified flow: The API now handles both Real and Demo keys correctly.
                const res = await fetch('/api/payment/toss/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentKey,
                        orderId,
                        amount: Number(amount)
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Payment confirmation failed');
                }

                setStatus('success');
                setMessage(paymentKey.startsWith('DEMO_KEY_')
                    ? '데모 결제가 완료되었습니다! (시뮬레이션)'
                    : '결제가 완료되었습니다! 마이페이지로 이동합니다...'
                );

                // Auto-redirect
                setTimeout(() => router.push('/mypage'), 3000);

            } catch (error: any) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setMessage(error.message || '결제 확인 중 오류가 발생했습니다.');
            }
        };

        verifyPayment();
    }, [paymentKey, orderId, amount, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                {status === 'verifying' && (
                    <>
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 처리 중</h1>
                        <p className="text-gray-500">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            ✓
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 성공!</h1>
                        <p className="text-gray-500 mb-6">Human Pulse 프리미엄 회원이 되신 것을 환영합니다.</p>
                        <Link href="/mypage" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                            마이페이지로 이동
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            ✕
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
                        <p className="text-red-500 mb-6">{message}</p>
                        <Link href="/pricing" className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">
                            요금제 페이지로 돌아가기
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
