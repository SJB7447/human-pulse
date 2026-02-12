'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEmotionColor, EmotionType } from '@/utils/emotions';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface InteractiveStoryProps {
    story: any;
    articleId: string;
}

export default function InteractiveStory({ story, articleId }: InteractiveStoryProps) {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [saving, setSaving] = useState(false);

    const colors = getEmotionColor(story.emotion as EmotionType);
    const supabase = createClient();
    const { showToast } = useToast();
    const router = useRouter();

    const currentScene = story.scenes[currentSceneIndex];
    const isLastScene = currentSceneIndex === story.scenes.length - 1;

    const handleNext = () => {
        if (!isLastScene) {
            setCurrentSceneIndex((prev) => prev + 1);
        } else {
            setIsCompleted(true);
        }
    };

    const handlePrev = () => {
        if (currentSceneIndex > 0) {
            setCurrentSceneIndex((prev) => prev - 1);
        }
    };

    const [userOpinion, setUserOpinion] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                showToast('스토리를 저장하려면 로그인하세요.', 'info');
                router.push('/login');
                return;
            }

            const res = await fetch('/api/save-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    articleId: articleId,
                    emotion: story.emotion,
                    userOpinion: userOpinion, // Send user opinion
                    isPublic: isPublic // Send public status
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.isLimitReached) {
                    showToast(`무료 한도 초과 (${data.limit}/${data.limit}). 무제한 저장을 위해 업그레이드하세요!`, 'error');
                    setTimeout(() => router.push('/pricing'), 2000);
                    return;
                }
                throw new Error(data.error || '저장 실패');
            }

            showToast('스토리가 프로필에 저장되었습니다!', 'success');
            router.push('/mypage');

        } catch (error: any) {
            showToast('스토리 저장 실패: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (isCompleted) {
        return (
            <div className={`max-w-2xl mx-auto p-8 rounded-3xl border-2 ${colors.border} ${colors.bg} shadow-lg text-center`}>
                <h2 className={`text-3xl font-bold mb-6 ${colors.text}`}>여정 완료</h2>
                <div className="bg-white/60 p-6 rounded-xl mb-8">
                    <p className="text-gray-700 text-lg mb-4">
                        이 스토리의 감정적 깊이를 탐험하셨습니다.
                    </p>
                    <p className="font-semibold text-gray-900">
                        지배적인 감정: <span className="uppercase">{story.emotion.replace('_', ' ')}</span>
                    </p>
                </div>

                <div className="mb-8 text-left space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            이 기사에 대한 당신의 생각은 무엇인가요? (선택사항)
                        </label>
                        <textarea
                            value={userOpinion}
                            onChange={(e) => setUserOpinion(e.target.value)}
                            placeholder="이곳에 짧은 감상평을 남겨주세요..."
                            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="isPublic" className="text-sm text-gray-600 select-none cursor-pointer">
                            커뮤니티에 내 생각 공유하기
                        </label>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => { setIsCompleted(false); setCurrentSceneIndex(0); }}
                        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                    >
                        다시하기
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${colors.accent} disabled:opacity-70`}
                    >
                        {saving ? '저장 중...' : '내 펄스에 저장'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`max-w-2xl mx-auto p-6 rounded-3xl border-2 ${colors.border} ${colors.bg} shadow-lg relative overflow-hidden`}>
            <h2 className={`text-2xl font-bold mb-4 ${colors.text} text-center`}>{story.title}</h2>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentScene.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/50"
                >
                    <div className="prose prose-lg mb-6 text-gray-800">
                        {currentScene.text}
                    </div>

                    {currentScene.visual_description && (
                        <div className="mb-6 rounded-lg overflow-hidden shadow-md border border-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://source.unsplash.com/random/800x400/?${encodeURIComponent(currentScene.visual_description.split(' ').slice(0, 3).join(','))}`}
                                alt="Scene visual"
                                className="w-full h-48 object-cover"
                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                            />
                            <div className="text-xs text-gray-500 italic p-2 bg-gray-50 border-t border-gray-100">
                                시각적 프롬프트: {currentScene.visual_description}
                            </div>
                        </div>
                    )}

                    {currentScene.interactive_element && (
                        <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
                            <p className="font-semibold text-gray-700 mb-2">{currentScene.interactive_element.question || "이 점에 대해 생각해보세요..."}</p>
                            <div className="flex flex-col gap-2">
                                {currentScene.interactive_element.options?.map((opt: string, idx: number) => (
                                    <button key={idx} className={`text-left px-4 py-2 rounded border hover:bg-gray-100 transition-colors ${colors.border}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-6">
                <button
                    onClick={handlePrev}
                    disabled={currentSceneIndex === 0}
                    className="px-4 py-2 text-gray-500 disabled:opacity-30 hover:text-gray-800 transition-colors"
                >
                    &larr; 이전
                </button>
                <button
                    onClick={handleNext}
                    className={`px-6 py-2 rounded-full font-semibold text-white shadow-md transition-transform active:scale-95 ${colors.accent}`}
                >
                    {isLastScene ? '여정 마치기' : '다음 장면 &rarr;'}
                </button>
            </div>

            <div className="mt-4 flex justify-center gap-1">
                {story.scenes.map((_: any, idx: number) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSceneIndex ? `w-8 ${colors.accent}` : 'w-2 bg-gray-300'}`}
                    />
                ))}
            </div>
        </div>
    );
}

