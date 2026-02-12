import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { PenTool, Eye, EyeOff, Calendar, Tag } from 'lucide-react';
import { EMOTION_COLORS, EMOTION_HEX, EmotionType } from '@/utils/emotions';

export default async function MyArticlesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
                    <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
                        로그인
                    </Link>
                </div>
            </div>
        );
    }

    const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        내 기사
                    </h1>
                    <p className="text-gray-500 mt-1">작성한 기사를 관리하세요.</p>
                </div>
                <Link
                    href="/reporter"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <PenTool size={16} />
                    새 기사 작성
                </Link>
            </div>

            {(!articles || articles.length === 0) ? (
                <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100/60">
                    <PenTool size={48} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">아직 작성한 기사가 없습니다</h2>
                    <p className="text-gray-400 mb-6">AI 도구를 활용하여 첫 번째 기사를 작성해 보세요!</p>
                    <Link
                        href="/reporter"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                        <PenTool size={16} />
                        기사 작성 시작
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {articles.map((article: any) => (
                        <div
                            key={article.id}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-gray-100/60 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex gap-4">
                                {article.image_url && (
                                    <div className="w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={article.image_url}
                                            alt={article.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <Link href={`/article/${article.id}`} className="group-hover:text-blue-600 transition">
                                            <h3 className="font-bold text-gray-900 truncate">{article.title}</h3>
                                        </Link>
                                        <span className={`flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-full ${article.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {article.published ? <Eye size={12} /> : <EyeOff size={12} />}
                                            {article.published ? '발행' : '비공개'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{article.summary}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span
                                            className="px-2 py-0.5 rounded text-xs font-medium text-white"
                                            style={{ backgroundColor: EMOTION_HEX[article.emotion as EmotionType] || '#6B7280' }}
                                        >
                                            {(article.emotion || '').replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(article.created_at).toLocaleDateString('ko-KR')}
                                        </span>
                                        {article.keywords && (
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Tag size={12} />
                                                {Array.isArray(article.keywords) ? article.keywords.slice(0, 3).join(', ') : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
