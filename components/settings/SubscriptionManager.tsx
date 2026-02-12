'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface SubscriptionManagerProps {
    status: string;
    plan: string | null;
    periodEnd: string | null;
}

export default function SubscriptionManager({ status, plan, periodEnd }: SubscriptionManagerProps) {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const isPremium = status === 'active';

    const handleCancel = async () => {
        if (!confirm('정말로 구독을 취소하시겠습니까? 프리미엄 기능이 즉시 중단될 수 있습니다.')) return;

        setLoading(true);
        try {
            const response = await fetch('/api/payment/cancel', {
                method: 'POST',
            });

            if (!response.ok) throw new Error('Failed to cancel subscription');

            showToast('구독이 성공적으로 취소되었습니다.', 'success');
            router.refresh();
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/50 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                구독 관리
                {isPremium && (
                    <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded-full font-medium">
                        PREMIUM
                    </span>
                )}
            </h2>

            <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">현재 플랜</p>
                        <p className="text-lg font-bold text-gray-900 capitalize">
                            {plan || 'Free Plan'}
                        </p>
                    </div>
                    {isPremium ? (
                        <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium mb-1">만료일 / 갱신일</p>
                            <p className="text-gray-900 font-semibold">
                                {periodEnd ? new Date(periodEnd).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    ) : (
                        <div className="text-right">
                            <a href="/pricing" className="text-blue-600 hover:text-blue-700 font-bold text-sm hover:underline">
                                프리미엄 업그레이드 &rarr;
                            </a>
                        </div>
                    )}
                </div>

                {isPremium && (
                    <div className="flex justify-end pt-4 border-t border-gray-200/50">
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? '처리 중...' : '구독 취소'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
