'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { EmotionType, EMOTION_COLORS, EMOTION_HEX } from '@/utils/emotions';
import { useToast } from '@/components/ui/Toast';
import {
    Search, PenTool, CheckCircle, ImageIcon, Send,
    Sparkles, Loader2, ArrowRight, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';

type Step = 'keywords' | 'draft' | 'spellcheck' | 'image' | 'publish';

interface KeywordResult {
    main_keywords: string[];
    related_topics: string[];
    suggested_angles: string[];
    trending_context: string;
}

interface SpellCheckResult {
    corrected_text: string;
    corrections: { original: string; corrected: string; reason: string }[];
    score: number;
    feedback: string;
}

export default function ReporterPage() {
    const [activeStep, setActiveStep] = useState<Step>('keywords');
    const [topic, setTopic] = useState('');
    const [keywordResult, setKeywordResult] = useState<KeywordResult | null>(null);
    const [outline, setOutline] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        summary: '',
        emotion: 'political_red' as EmotionType,
        keywords: '',
        image_url: '',
        published: true,
    });

    const [spellResult, setSpellResult] = useState<SpellCheckResult | null>(null);
    const [imagePrompt, setImagePrompt] = useState('');
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const router = useRouter();
    const supabase = createClient();
    const { showToast } = useToast();

    const steps: { key: Step; label: string; icon: any; description: string }[] = [
        { key: 'keywords', label: '키워드 검색', icon: Search, description: 'AI가 관련 키워드와 트렌드를 분석합니다' },
        { key: 'draft', label: '기사 작성', icon: PenTool, description: 'AI 초안을 기반으로 기사를 작성합니다' },
        { key: 'spellcheck', label: '맞춤법 검사', icon: CheckCircle, description: 'AI가 맞춤법과 문법을 교정합니다' },
        { key: 'image', label: '이미지 생성', icon: ImageIcon, description: 'AI가 기사 대표 이미지를 생성합니다' },
        { key: 'publish', label: '발행', icon: Send, description: '기사를 검토하고 발행합니다' },
    ];

    // --- API Handlers ---

    const handleKeywordSearch = async () => {
        if (!topic.trim()) { showToast('주제를 입력하세요.', 'error'); return; }
        setLoading(prev => ({ ...prev, keywords: true }));
        try {
            const res = await fetch('/api/reporter/keywords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            });
            if (!res.ok) throw new Error('키워드 검색 실패');
            const data = await res.json();
            setKeywordResult(data);
            if (data.main_keywords) {
                setFormData(prev => ({ ...prev, keywords: data.main_keywords.join(', ') }));
            }
            showToast('키워드 분석 완료!', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(prev => ({ ...prev, keywords: false }));
        }
    };

    const handleDraftGenerate = async () => {
        setLoading(prev => ({ ...prev, draft: true }));
        try {
            const res = await fetch('/api/reporter/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    keywords: formData.keywords,
                    outline,
                }),
            });
            if (!res.ok) throw new Error('초안 생성 실패');
            const data = await res.json();
            setFormData(prev => ({
                ...prev,
                title: data.title || prev.title,
                content: data.content || prev.content,
                summary: data.summary || prev.summary,
                keywords: data.keywords?.join(', ') || prev.keywords,
                emotion: data.emotion || prev.emotion,
            }));
            showToast('AI 초안이 생성되었습니다!', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(prev => ({ ...prev, draft: false }));
        }
    };

    const handleSpellCheck = async () => {
        if (!formData.content || formData.content.length < 10) {
            showToast('기사 본문이 10자 이상이어야 합니다.', 'error');
            return;
        }
        setLoading(prev => ({ ...prev, spellcheck: true }));
        try {
            const res = await fetch('/api/reporter/spellcheck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: formData.content }),
            });
            if (!res.ok) throw new Error('맞춤법 검사 실패');
            const data = await res.json();
            setSpellResult(data);
            showToast(`맞춤법 검사 완료! 점수: ${data.score}/100`, 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(prev => ({ ...prev, spellcheck: false }));
        }
    };

    const applySpellCorrections = () => {
        if (spellResult?.corrected_text) {
            setFormData(prev => ({ ...prev, content: spellResult.corrected_text }));
            showToast('교정 내용이 적용되었습니다.', 'success');
        }
    };

    const handleGenerateImage = async () => {
        const prompt = imagePrompt || formData.summary || formData.title;
        if (!prompt) { showToast('이미지 설명을 입력하세요.', 'error'); return; }
        setLoading(prev => ({ ...prev, image: true }));
        try {
            const res = await fetch('/api/reporter/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            if (!res.ok) throw new Error('이미지 생성 실패');
            const data = await res.json();
            setFormData(prev => ({ ...prev, image_url: data.image_url }));
            showToast(`AI 이미지 생성 완료! (${data.source === 'gemini' ? 'Gemini' : 'Pollinations'})`, 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(prev => ({ ...prev, image: false }));
        }
    };

    const handlePublish = async () => {
        if (!formData.title || !formData.content) {
            showToast('제목과 본문은 필수입니다.', 'error');
            return;
        }
        setLoading(prev => ({ ...prev, publish: true }));
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('로그인이 필요합니다.');

            const { error } = await supabase.from('articles').insert({
                title: formData.title,
                content: formData.content,
                summary: formData.summary,
                emotion: formData.emotion,
                keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
                image_url: formData.image_url,
                published: formData.published,
                author_id: user.id,
            });
            if (error) throw error;
            showToast('기사가 성공적으로 발행되었습니다!', 'success');
            router.push('/reporter/my-articles');
            router.refresh();
        } catch (error: any) {
            showToast('발행 실패: ' + error.message, 'error');
        } finally {
            setLoading(prev => ({ ...prev, publish: false }));
        }
    };

    // --- Render Helpers ---

    const renderStepIndicator = () => (
        <div className="flex items-center justify-between mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/60 shadow-sm overflow-x-auto">
            {steps.map((step, i) => {
                const isActive = activeStep === step.key;
                const stepIndex = steps.findIndex(s => s.key === activeStep);
                const isDone = i < stepIndex;
                return (
                    <button
                        key={step.key}
                        onClick={() => setActiveStep(step.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-200'
                            : isDone
                                ? 'bg-green-50 text-green-700'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <step.icon size={16} />
                        <span className="hidden sm:inline">{step.label}</span>
                        {i < steps.length - 1 && (
                            <ArrowRight size={14} className="ml-2 text-gray-300 hidden lg:block" />
                        )}
                    </button>
                );
            })}
        </div>
    );

    const renderKeywordsStep = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 취재 주제</label>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur-sm"
                        placeholder="예: AI 규제 정책, 부동산 시장 동향..."
                        onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
                    />
                    <button
                        onClick={handleKeywordSearch}
                        disabled={loading.keywords}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading.keywords ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        AI 분석
                    </button>
                </div>
            </div>

            {keywordResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                    <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100">
                        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <Search size={16} /> 핵심 키워드
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {keywordResult.main_keywords.map((kw, i) => (
                                <span key={i} className="px-3 py-1.5 bg-white rounded-full text-sm font-medium text-blue-700 border border-blue-200 shadow-sm">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-purple-50/80 backdrop-blur-sm rounded-xl p-5 border border-purple-100">
                        <h3 className="font-semibold text-purple-800 mb-3">📌 연관 주제</h3>
                        <ul className="space-y-1.5">
                            {keywordResult.related_topics.map((t, i) => (
                                <li key={i} className="text-sm text-purple-700">• {t}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2 bg-green-50/80 backdrop-blur-sm rounded-xl p-5 border border-green-100">
                        <h3 className="font-semibold text-green-800 mb-3">💡 추천 앵글</h3>
                        <ul className="space-y-2">
                            {keywordResult.suggested_angles.map((a, i) => (
                                <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                                    <span className="bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                                    {a}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {keywordResult.trending_context && (
                        <div className="md:col-span-2 bg-amber-50/80 backdrop-blur-sm rounded-xl p-5 border border-amber-100">
                            <h3 className="font-semibold text-amber-800 mb-2">🔥 트렌드 맥락</h3>
                            <p className="text-sm text-amber-700">{keywordResult.trending_context}</p>
                        </div>
                    )}
                </div>
            )}

            {keywordResult && (
                <button
                    onClick={() => setActiveStep('draft')}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    다음: 기사 작성 <ArrowRight size={18} />
                </button>
            )}
        </div>
    );

    const renderDraftStep = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📝 기사 방향 / 개요 (선택)</label>
                <textarea
                    value={outline}
                    onChange={(e) => setOutline(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur-sm resize-none"
                    placeholder="기사의 방향이나 포함할 내용을 적어주세요... (AI가 참고합니다)"
                />
                <button
                    onClick={handleDraftGenerate}
                    disabled={loading.draft}
                    className="mt-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {loading.draft ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {formData.content ? 'AI 초안 다시 생성' : 'AI 초안 생성'}
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">제목</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur-sm text-lg font-medium"
                        placeholder="기사 제목..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">본문</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        rows={15}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur-sm font-mono text-sm leading-relaxed"
                        placeholder="기사 본문을 입력하세요..."
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">요약</label>
                        <input
                            type="text"
                            value={formData.summary}
                            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur-sm"
                            placeholder="기사 요약..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">감정 카테고리</label>
                        <select
                            value={formData.emotion}
                            onChange={(e) => setFormData(prev => ({ ...prev, emotion: e.target.value as EmotionType }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur-sm"
                        >
                            {Object.keys(EMOTION_COLORS).map(emotion => (
                                <option key={emotion} value={emotion}>
                                    {emotion.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">키워드 (쉼표 구분)</label>
                    <input
                        type="text"
                        value={formData.keywords}
                        onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur-sm"
                        placeholder="경제, 기술, AI..."
                    />
                </div>
            </div>

            {formData.content && (
                <button
                    onClick={() => setActiveStep('spellcheck')}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    다음: 맞춤법 검사 <ArrowRight size={18} />
                </button>
            )}
        </div>
    );

    const renderSpellcheckStep = () => (
        <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">✅ 맞춤법 검사</h3>
                    <button
                        onClick={handleSpellCheck}
                        disabled={loading.spellcheck}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading.spellcheck ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        검사 실행
                    </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 max-h-60 overflow-y-auto font-mono leading-relaxed">
                    {formData.content || '기사 본문이 비어 있습니다. "기사 작성" 단계에서 본문을 작성하세요.'}
                </div>
            </div>

            {spellResult && (
                <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center gap-4">
                        <div className={`text-4xl font-bold ${spellResult.score >= 90 ? 'text-green-600' : spellResult.score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {spellResult.score}<span className="text-lg text-gray-400">/100</span>
                        </div>
                        <p className="text-sm text-gray-600">{spellResult.feedback}</p>
                    </div>

                    {spellResult.corrections.length > 0 && (
                        <div className="bg-amber-50/80 backdrop-blur-sm rounded-xl p-5 border border-amber-100">
                            <h4 className="font-semibold text-amber-800 mb-3">📝 교정 사항 ({spellResult.corrections.length}건)</h4>
                            <div className="space-y-2">
                                {spellResult.corrections.map((c, i) => (
                                    <div key={i} className="bg-white rounded-lg p-3 border border-amber-200 text-sm">
                                        <span className="line-through text-red-500">{c.original}</span>
                                        <span className="mx-2">→</span>
                                        <span className="text-green-600 font-medium">{c.corrected}</span>
                                        <p className="text-gray-500 text-xs mt-1">{c.reason}</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={applySpellCorrections}
                                className="mt-4 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={16} />
                                교정 적용하기
                            </button>
                        </div>
                    )}

                    {spellResult.corrections.length === 0 && (
                        <div className="bg-green-50 rounded-xl p-5 border border-green-200 text-center">
                            <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                            <p className="text-green-700 font-medium">맞춤법 오류가 없습니다! 완벽한 기사입니다.</p>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={() => setActiveStep('image')}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
                다음: 이미지 생성 <ArrowRight size={18} />
            </button>
        </div>
    );

    const renderImageStep = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🖼️ 이미지 설명</label>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur-sm"
                        placeholder={formData.summary || formData.title || '이미지로 만들 장면을 묘사하세요...'}
                    />
                    <button
                        onClick={handleGenerateImage}
                        disabled={loading.image}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pink-200 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading.image ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                        AI 생성
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">비워두면 기사 요약 또는 제목이 자동으로 사용됩니다.</p>
            </div>

            {formData.image_url && (
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={formData.image_url}
                        alt="Generated Article Image"
                        className="w-full aspect-video object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/1280x720?text=이미지+로딩중...';
                        }}
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">이미지 URL (직접 입력도 가능)</label>
                <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 backdrop-blur-sm"
                    placeholder="https://..."
                />
            </div>

            <button
                onClick={() => setActiveStep('publish')}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
                다음: 발행 <ArrowRight size={18} />
            </button>
        </div>
    );

    const renderPublishStep = () => (
        <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-800 mb-4">📋 기사 미리보기</h3>

                {formData.image_url && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.image_url} alt="Preview" className="w-full aspect-video object-cover" />
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <span className="text-xs text-gray-400">제목</span>
                        <h2 className="text-xl font-bold text-gray-900">{formData.title || '(제목 없음)'}</h2>
                    </div>
                    <div>
                        <span className="text-xs text-gray-400">요약</span>
                        <p className="text-gray-600">{formData.summary || '(요약 없음)'}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400">카테고리</span>
                        <span
                            className="px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: EMOTION_HEX[formData.emotion] }}
                        >
                            {formData.emotion.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-400">키워드</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {formData.keywords.split(',').filter(Boolean).map((kw, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{kw.trim()}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-gray-400">본문 (일부)</span>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-5 whitespace-pre-wrap">{formData.content || '(본문 없음)'}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">
                    즉시 발행 (체크 해제 시 비공개)
                </label>
            </div>

            <button
                onClick={handlePublish}
                disabled={loading.publish || !formData.title || !formData.content}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading.publish ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                기사 발행하기
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    기사 작성
                </h1>
                <p className="text-gray-500 mt-1">AI 도구를 활용하여 전문적인 기사를 작성하세요.</p>
            </div>

            {renderStepIndicator()}

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-100/60 shadow-sm">
                {activeStep === 'keywords' && renderKeywordsStep()}
                {activeStep === 'draft' && renderDraftStep()}
                {activeStep === 'spellcheck' && renderSpellcheckStep()}
                {activeStep === 'image' && renderImageStep()}
                {activeStep === 'publish' && renderPublishStep()}
            </div>
        </div>
    );
}
