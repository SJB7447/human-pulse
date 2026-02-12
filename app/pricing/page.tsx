import { createClient } from '@/utils/supabase/server';
import TossCheckout from '@/components/payment/TossCheckout';
import Link from 'next/link';

export default async function PricingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Generate a unique order ID: order_[userId]_[timestamp]
    const orderId = user ? `hp_order_${user.id}_${Date.now()}` : '';

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                    감정의 잠재력을 온전히 깨우세요
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    AI 기반 인터랙티브 스토리와 상세한 감정 분석을 무제한으로 이용하세요.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">무료 (Free)</h2>
                    <p className="text-gray-500 mb-6">가볍게 즐기는 독자를 위한 기본 기능</p>
                    <div className="text-4xl font-bold text-gray-900 mb-8">
                        ₩0 <span className="text-lg font-normal text-gray-500">/월</span>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>일일 인터랙티브 스토리 (3회 제한)</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>기본 기분 환기 기능</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>커뮤니티 접근 권한</span>
                        </li>
                    </ul>

                    {user ? (
                        <div className="w-full bg-gray-100 text-gray-600 font-bold py-3 px-4 rounded-xl text-center cursor-not-allowed">
                            현재 이용 중
                        </div>
                    ) : (
                        <Link href="/signup" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-center transition">
                            무료로 시작하기
                        </Link>
                    )}
                </div>

                {/* Premium Plan */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-600 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                        인기 (POPULAR)
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">프리미엄 (Premium)</h2>
                    <p className="text-gray-500 mb-6">더 깊은 감정적 명료함을 찾는 분들을 위해</p>
                    <div className="text-4xl font-bold text-gray-900 mb-8">
                        ₩9,900 <span className="text-lg font-normal text-gray-500">/월</span>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-2">
                            <span className="text-blue-500">✓</span>
                            <span className="font-semibold">인터랙티브 스토리 무제한 이용</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-blue-500">✓</span>
                            <span>상세 감정 분석 리포트</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-blue-500">✓</span>
                            <span>AI 생성 우선 처리 (대기 시간 단축)</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-blue-500">✓</span>
                            <span>'나만의 기사' 무제한 저장</span>
                        </li>
                    </ul>

                    {user ? (
                        <TossCheckout
                            amount={9900}
                            orderId={orderId}
                            orderName="Human Pulse 프리미엄 구독"
                            customerName={user.email?.split('@')[0] || 'Subscriber'}
                            customerEmail={user.email}
                            successUrl={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`}
                            failUrl={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/fail`}
                        />
                    ) : (
                        <Link href="/login?next=/pricing" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-center transition">
                            로그인하고 구독하기
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
