'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function PaymentFailContent() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message') || '결제가 실패했거나 취소되었습니다.';
    const code = searchParams.get('code');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    !
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
                <p className="text-gray-500 mb-2">{message}</p>
                {code && <p className="text-xs text-gray-400 mb-6">에러 코드: {code}</p>}

                <Link href="/pricing" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                    다시 시도하기
                </Link>
            </div>
        </div>
    );
}

export default function PaymentFailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentFailContent />
        </Suspense>
    );
}
