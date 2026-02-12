import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { EMOTION_COLORS } from '@/utils/emotions';

export const revalidate = 60; // Revalidate every minute

export default async function CommunityPage() {
    const supabase = await createClient();

    // Fetch recent interactions from all users
    const { data: interactions } = await supabase
        .from('interactions')
        .select(`
        *,
        articles (
            id,
            title,
            emotion
        )
    `)
        .eq('is_public', true) // Only show public interactions
        .order('completed_at', { ascending: false })
        .limit(30);

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">커뮤니티 펄스</h1>
                <p className="text-lg text-gray-500">지금 다른 사람들은 어떤 감정과 생각을 공유하고 있을까요?</p>
                <div className="mt-6">
                    <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium transition">&larr; 홈으로 돌아가기</Link>
                </div>
            </header>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {interactions?.map((item: any) => {
                    // Use centralized emotion colors
                    const emotionKey = item.emotion_log as keyof typeof EMOTION_COLORS;
                    const colorConfig = EMOTION_COLORS[emotionKey] || EMOTION_COLORS.tragic_gray;

                    // Glassmorphism card style
                    // Using a subtle background with backdrop blur if supported, though for a masonry layout solid bg is safer
                    // We'll stick to a clean white card but with better shadows and border logic matching InteractiveStory

                    return (
                        <div key={item.id} className="break-inside-avoid bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">

                            {/* Decorative gradient blob based on emotion */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl ${colorConfig.accent.replace('bg-', 'bg-')}`} />

                            {/* Header: User & Time */}
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colorConfig.bg} ${colorConfig.text}`}>
                                        {(item.profiles?.username || item.profiles?.full_name || 'A').substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {item.profiles?.username || '익명 사용자'}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Content: Opinion */}
                            {item.user_opinion ? (
                                <div className="mb-6 relative z-10">
                                    <div className="relative">
                                        <span className={`absolute -top-2 -left-1 text-4xl opacity-20 font-serif ${colorConfig.text}`}>"</span>
                                        <p className="text-gray-800 text-lg leading-relaxed font-medium italic relative z-10 px-3 py-1">
                                            {item.user_opinion}
                                        </p>
                                        <span className={`absolute -bottom-4 right-2 text-4xl opacity-20 font-serif ${colorConfig.text}`}>"</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6 relative z-10">
                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize border ${colorConfig.bg} ${colorConfig.border} ${colorConfig.text}`}>
                                        {item.emotion_log?.replace('_', ' ') || '무언가'}를 느낌
                                    </div>
                                </div>
                            )}

                            {/* Footer: Article Link */}
                            <div className="pt-4 border-t border-gray-50 relative z-10">
                                <Link href={`/article/${item.articles?.id}`} className="block group/link">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Related Article</p>
                                            <h3 className="font-semibold text-gray-900 group-hover/link:text-blue-600 transition line-clamp-2 text-sm">
                                                {item.articles?.title || '알 수 없는 기사'}
                                            </h3>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full mt-1 ${colorConfig.accent}`} />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    );
                })}

                {(!interactions || interactions.length === 0) && (
                    <div className="col-span-full text-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-lg">아직 공개된 커뮤니티 활동이 없습니다.</p>
                        <p className="text-sm mt-2">이야기를 읽고 첫 번째로 생각을 공유해보세요!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
