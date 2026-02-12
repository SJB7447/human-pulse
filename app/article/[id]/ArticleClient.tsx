'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import InteractiveStory from '@/components/InteractiveStory';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

export default function ArticleClient({ article }: { article: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [story, setStory] = useState<any>(null);
    const [opinion, setOpinion] = useState('');
    const [isSavingOpinion, setIsSavingOpinion] = useState(false);
    const { showToast } = useToast();
    const supabase = createClient();

    const generateStory = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: article.content }),
            });

            const data = await res.json();

            if (res.status === 403 && data.isLimitReached) {
                showToast(`일일 한도 초과 (${data.limit} 스토리/일). 무제한 이용을 위해 프리미엄으로 업그레이드하세요!`, 'error');
                // Optional: Redirect to pricing or show modal
                return;
            }

            if (!res.ok) throw new Error(data.error || '스토리 생성 실패');

            setStory(data);
            showToast('인터랙티브 스토리가 생성되었습니다!', 'success');
        } catch (err: any) {
            showToast(err.message || '인터랙티브 스토리 생성 실패. 다시 시도해주세요.', 'error');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveOpinion = async () => {
        if (!opinion.trim()) return;
        setIsSavingOpinion(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast('노트를 저장하려면 로그인하세요.', 'error');
                return;
            }

            const { error } = await supabase.from('interactions').insert({
                user_id: user.id,
                article_id: article.id,
                interaction_type: 'view', // Using 'view' as base type, or could be 'note' if constraint allows
                user_opinion: opinion,
                // We're inserting a new interaction record for this note.
                // In a production app, we might want to UPSERT based on (user_id, article_id, type='view')
                // but simpler for now to just log it.
            });

            if (error) throw error;

            showToast('읽기 기록에 노트가 저장되었습니다!', 'success');
            setOpinion(''); // Clear after save? Or keep it? Clearing for now.
        } catch (error: any) {
            showToast('노트 저장 실패: ' + error.message, 'error');
        } finally {
            setIsSavingOpinion(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen">
            <div className="mb-6">
                <Link href="/" className="text-gray-500 hover:text-gray-900">&larr; 피드로 돌아가기</Link>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-gray-900">{article.title}</h1>

            {!story && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap font-serif text-lg">
                        {article.content}
                    </div>

                    <div className="flex justify-center mt-8 pt-8 border-t border-gray-100">
                        <button
                            onClick={generateStory}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    경험 생성 중...
                                </>
                            ) : (
                                <>
                                    ✨ 이 스토리 체험하기
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {story && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <InteractiveStory story={story} articleId={article.id} />
                </motion.div>
            )}

            {/* User Opinion Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">나의 생각</h3>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <textarea
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] mb-3 bg-white"
                        placeholder="이 기사에 대해 어떻게 생각하시나요? 나만의 비공개 노트를 남겨보세요..."
                        value={opinion}
                        onChange={(e) => setOpinion(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveOpinion}
                            disabled={isSavingOpinion || !opinion.trim()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSavingOpinion ? '저장 중...' : '노트 저장'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
