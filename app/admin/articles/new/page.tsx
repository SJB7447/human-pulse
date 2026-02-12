'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { EmotionType, EMOTION_COLORS } from '@/utils/emotions';
import { useToast } from '@/components/ui/Toast';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

export default function NewArticlePage() {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        summary: '',
        emotion: 'political_red' as EmotionType,
        keywords: '', // Comma separated
        image_url: '',
        published: true,
    });

    const router = useRouter();
    const supabase = createClient();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                title: (!prev.title && data.suggested_title) ? data.suggested_title : prev.title,
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

    const handleGenerateImage = async () => {
        if (!formData.title && !formData.summary) {
            showToast("제목이나 요약이 있어야 이미지를 생성할 수 있습니다.", 'error');
            return;
        }

        const prompt = formData.summary || formData.title;
        // Clean prompt for URL
        const cleanPrompt = encodeURIComponent(prompt.slice(0, 100) + ", cinematic lighting, high quality, news photography, 4k");
        const seed = Math.floor(Math.random() * 1000);
        const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1280&height=720&seed=${seed}&nologo=true`;

        setFormData(prev => ({ ...prev, image_url: imageUrl }));
        showToast("AI 이미지가 생성되었습니다!", 'success');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('articles').insert({
                title: formData.title,
                content: formData.content,
                summary: formData.summary,
                emotion: formData.emotion,
                keywords: formData.keywords.split(',').map(k => k.trim()),
                image_url: formData.image_url,
                published: formData.published,
            });

            if (error) throw error;

            showToast("Article published successfully!", 'success');
            router.push('/admin');
            router.refresh();
        } catch (error: any) {
            showToast('Error creating article: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">새 기사 작성</h1>

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
                        placeholder="기사 제목을 입력하세요..."
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
                        placeholder="기사 본문을 입력하세요..."
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        id="ai-btn"
                        onClick={handleGenerateAI}
                        className="px-4 py-2 text-purple-600 font-medium hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 flex items-center gap-2"
                    >
                        <Sparkles size={16} />
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
                            placeholder="짧은 요약문..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
                        <span>대표 이미지 URL</span>
                        <button
                            type="button"
                            onClick={handleGenerateImage}
                            className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                        >
                            <ImageIcon size={12} />
                            AI 이미지 생성 (Pollinations.ai)
                        </button>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://..."
                        />
                    </div>
                    {formData.image_url && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={formData.image_url}
                                alt="Article Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error';
                                }}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">키워드 (쉼표로 구분)</label>
                    <input
                        type="text"
                        name="keywords"
                        value={formData.keywords}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="예: 경제, 기술, AI"
                    />
                </div>

                <div className="flex items-center gap-3 py-2">
                    <input
                        type="checkbox"
                        id="published"
                        name="published"
                        checked={formData.published}
                        onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="published" className="text-sm font-medium text-gray-700">발행 (사용자에게 공개)</label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? '발행 중...' : '기사 발행'}
                    </button>
                </div>
            </form>
        </div>
    );
}
