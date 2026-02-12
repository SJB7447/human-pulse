'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { EmotionType, EMOTION_COLORS } from '@/utils/emotions';
import { useToast } from '@/components/ui/Toast';

export default function EditArticlePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        summary: '',
        emotion: 'political_red' as EmotionType,
        keywords: '', // Comma separated
        published: false,
    });

    const router = useRouter();
    const params = useParams();
    const supabase = createClient();
    const articleId = params.id as string;

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('id', articleId)
                    .single();

                if (error) throw error;

                setFormData({
                    title: data.title,
                    content: data.content,
                    summary: data.summary || '',
                    emotion: data.emotion,
                    keywords: data.keywords?.join(', ') || '',
                    published: data.published,
                });
            } catch (error: any) {
                showToast('Error fetching article: ' + error.message, 'error');
                router.push('/admin');
            } finally {
                setLoading(false);
            }
        };

        if (articleId) fetchArticle();
    }, [articleId, supabase, router, showToast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleGenerateAI = async () => {
        if (!formData.content || formData.content.length < 50) {
            showToast("Please enter at least some content (50+ words) for the AI to analyze.", 'info');
            return;
        }

        const button = document.getElementById('ai-btn') as HTMLButtonElement;
        if (button) {
            button.disabled = true;
            button.innerText = "Analyzing...";
        }

        try {
            const res = await fetch('/api/admin/autofill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: formData.content }),
            });

            if (!res.ok) throw new Error('Failed to analyze content');

            const data = await res.json();

            setFormData(prev => ({
                ...prev,
                title: (!prev.title || prev.title === 'New Article') && data.suggested_title ? data.suggested_title : prev.title,
                summary: data.summary || prev.summary,
                keywords: data.keywords?.join(', ') || prev.keywords,
                emotion: data.emotion || prev.emotion,
            }));
            showToast("AI Analysis complete!", 'success');

        } catch (error: any) {
            showToast('AI Analysis failed: ' + error.message, 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerText = "✨ AI Auto-fill Summary & Tags";
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('articles')
                .update({
                    title: formData.title,
                    content: formData.content,
                    summary: formData.summary,
                    emotion: formData.emotion,
                    keywords: formData.keywords.split(',').map(k => k.trim()),
                    published: formData.published,
                })
                .eq('id', articleId);

            if (error) throw error;

            showToast("Article updated successfully!", 'success');
            router.push('/admin');
            router.refresh();
        } catch (error: any) {
            showToast('Error updating article: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-gray-500">에디터 로딩 중...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">기사 수정</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
                    <textarea
                        name="content"
                        required
                        rows={10}
                        value={formData.content}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        id="ai-btn"
                        onClick={handleGenerateAI}
                        className="px-4 py-2 text-purple-600 font-medium hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 flex items-center gap-2"
                    >
                        {formData.summary ? '🔄 AI 분석 다시하기' : '✨ AI 요약 및 태그 자동완성'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">감정 카테고리</label>
                        <select
                            name="emotion"
                            value={formData.emotion}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {Object.keys(EMOTION_COLORS).map(emotion => (
                                <option key={emotion} value={emotion}>
                                    {emotion.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">요약 (미리보기용)</label>
                        <input
                            type="text"
                            name="summary"
                            required
                            value={formData.summary}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">키워드 (쉼표로 구분)</label>
                    <input
                        type="text"
                        name="keywords"
                        value={formData.keywords}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 py-2">
                    <input
                        type="checkbox"
                        id="published"
                        name="published"
                        checked={formData.published}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="published" className="text-sm font-medium text-gray-700">발행 (사용자에게 공개)</label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? '저장 중...' : '기사 수정'}
                    </button>
                </div>
            </form>
        </div>
    );
}
