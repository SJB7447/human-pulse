'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface PremiumAnalysisProps {
    isPremium: boolean;
    recentEmotions: { emotion: string; date: string }[];
}

export default function PremiumAnalysis({ isPremium, recentEmotions }: PremiumAnalysisProps) {
    if (!isPremium) {
        return (
            <div className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        🔒
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">프리미엄 인사이트 잠김</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-xs">
                        주간 감정 트렌드와 맞춤형 AI 조언을 잠금 해제하여 내면을 더 깊이 이해하세요.
                    </p>
                    <Link href="/pricing" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold shadow-md hover:opacity-90 transition">
                        업그레이드하여 잠금 해제
                    </Link>
                </div>

                {/* Background (Blurred Content Placeholder) */}
                <div className="opacity-30 filter blur-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">주간 감정 트렌드</h2>
                    <div className="h-40 flex items-end gap-2 justify-between px-2">
                        {[40, 60, 30, 80, 50, 70, 45].map((h, i) => (
                            <div key={i} className="w-full bg-blue-100 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Logic to analyze trends (simple mock for now, can be sophisticated later)
    // Count emotions
    const counts: Record<string, number> = {};
    recentEmotions.forEach(e => {
        const key = e.emotion || 'neutral';
        counts[key] = (counts[key] || 0) + 1;
    });

    const dominantEmotion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    // AI Advice Mapping (Simple rule-based)
    const getAdvice = (emotion: string) => {
        if (emotion.includes('sad')) return "최근 기분이 가라앉으신 것 같네요. 가벼운 산책이나 일기를 통해 감정을 정리해보세요.";
        if (emotion.includes('anx') || emotion.includes('fear')) return "불안감이 자주 감지되었습니다. 잠자리에 들기 전 '차분한 파랑' 호흡 운동을 시도해보세요.";
        if (emotion.includes('ang') || emotion.includes('rage')) return "높은 에너지가 감지되었습니다. 이 열정을 신체 활동이나 창작 활동으로 승화시켜보세요.";
        if (emotion.includes('joy') || emotion.includes('happy')) return "긍정적인 에너지가 넘치시네요! 이 기분을 주변과 나누거나 무엇이 당신을 행복하게 하는지 기록해보세요.";
        return "감정의 균형이 잘 잡혀 있습니다. 매일 감정을 확인하며 이 평온함을 유지하세요.";
    };

    const advice = getAdvice(dominantEmotion);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-xl">✨</span> 프리미엄 인사이트
                </h2>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded uppercase">
                    주간 분석
                </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Insight Card */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-lg border border-purple-100">
                    <h3 className="text-sm font-semibold text-purple-800 mb-2 uppercase tracking-wide">AI 조언</h3>
                    <p className="text-gray-700 font-medium leading-relaxed">
                        "{advice}"
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-purple-600">
                        <span>가장 많이 느낀 감정 기반:</span>
                        <span className="font-bold capitalize bg-white px-2 py-1 rounded shadow-sm">
                            {dominantEmotion.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Trend List (Simple implementation) */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">최근 패턴</h3>
                    <div className="space-y-2">
                        {recentEmotions.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                                <span className="text-sm text-gray-700 capitalize font-medium">{item.emotion.replace('_', ' ')}</span>
                                <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString('ko-KR')}</span>
                            </div>
                        ))}
                        {recentEmotions.length === 0 && (
                            <p className="text-sm text-gray-400 italic">데이터가 충분하지 않음</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
