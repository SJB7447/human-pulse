import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, FileText, BarChart3, Users } from 'lucide-react';
// DeleteArticleButton is now used inside ArticleTable
import ArticleTable from '@/components/admin/ArticleTable';

export default async function AdminDashboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch real stats
    const { count: articleCount } = await supabase.from('articles').select('*', { count: 'exact', head: true });

    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    const { count: premiumCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');

    const { count: interactionCount } = await supabase.from('interactions').select('*', { count: 'exact', head: true });

    // Fetch Emotion Distribution
    // Note: Supabase doesn't support complex GROUP BY via simple client queries easily without RPC.
    // For now, we will fetch all interactions (assuming low volume) and aggregate in JS.
    // For production, use an RPC function or a materialized view.
    const { data: interactionData } = await supabase
        .from('interactions')
        .select('emotion_log');

    const emotionCounts: Record<string, number> = {};
    interactionData?.forEach((item: any) => {
        const emotion = item.emotion_log || 'unknown';
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    // Sort emotions by count
    const sortedEmotions = Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5

    const stats = [
        { label: 'Total Users', value: userCount || 0, icon: Users },
        { label: 'Premium Subscribers', value: premiumCount || 0, icon: Users },
        { label: 'Total Stories Played', value: interactionCount || 0, icon: BarChart3 },
        { label: 'Total Articles', value: articleCount || 0, icon: FileText },
    ];

    const { data: recentArticles } = await supabase
        .from('articles')
        .select('id, title, created_at, published, emotion')
        .order('created_at', { ascending: false })
        .limit(50); // Fetch more for client-side search

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
                <Link
                    href="/admin/articles/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                    <PlusCircle size={20} />
                    새 기사 작성
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">{
                                stat.label === 'Total Users' ? '총 사용자' :
                                    stat.label === 'Premium Subscribers' ? '프리미엄 구독자' :
                                        stat.label === 'Total Stories Played' ? '플레이된 스토리' :
                                            '총 기사 수'
                            }</h3>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Recent Articles */}
                <div className="lg:col-span-2">
                    <ArticleTable articles={recentArticles || []} />
                </div>

                {/* Emotion Trends (New) */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h2 className="font-semibold text-gray-800 mb-4">감정 트렌드</h2>
                    <div className="flex flex-col items-center justify-center py-6">
                        {sortedEmotions.length > 0 ? (
                            <div className="relative w-48 h-48">
                                {/* Simple CSS Conic Gradient for Pie Chart */}
                                <div
                                    className="w-full h-full rounded-full"
                                    style={{
                                        background: `conic-gradient(
                                            ${sortedEmotions.map(([emotion, count], index, array) => {
                                            const total = interactionCount || 1;
                                            const startPct = array.slice(0, index).reduce((acc, [, c]) => acc + (c / total) * 100, 0);
                                            const endPct = startPct + (count / total) * 100;

                                            const color = emotion.includes('red') ? '#ef4444' :
                                                emotion.includes('blue') ? '#3b82f6' :
                                                    emotion.includes('green') ? '#22c55e' :
                                                        emotion.includes('yellow') ? '#eab308' :
                                                            '#6b7280';

                                            return `${color} ${startPct}% ${endPct}%`;
                                        }).join(', ')}
                                        )`
                                    }}
                                />
                                <div className="absolute inset-0 m-12 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-gray-500 text-xs font-medium">감정 분포</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm text-center py-8">아직 감정 데이터가 없습니다.</p>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-6 w-full">
                            {sortedEmotions.map(([emotion, count]) => {
                                const percentage = interactionCount ? Math.round((count / interactionCount) * 100) : 0;
                                return (
                                    <div key={emotion} className="flex items-center gap-2 text-sm">
                                        <div className={`w-3 h-3 rounded-full ${emotion.includes('red') ? 'bg-red-500' :
                                            emotion.includes('blue') ? 'bg-blue-500' :
                                                emotion.includes('green') ? 'bg-green-500' :
                                                    emotion.includes('yellow') ? 'bg-yellow-500' :
                                                        'bg-gray-500'
                                            }`} />
                                        <span className="capitalize text-gray-700">{emotion.replace('_', ' ')}</span>
                                        <span className="text-gray-400 text-xs">{percentage}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
