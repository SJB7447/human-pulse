import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EmotionChart from '@/components/EmotionChart';
import PremiumAnalysis from '@/components/PremiumAnalysis';

export default async function MyPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch interactions (reading history)
    const { data: interactions } = await supabase
        .from('interactions')
        .select(`
        *,
        articles (
            title,
            emotion
        )
    `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_plan, current_period_end')
        .eq('id', user.id)
        .single();

    const isPremium = profile?.subscription_status === 'active';

    // Aggregate Data for Chart
    const emotionCounts: Record<string, number> = {};
    let totalEmotions = 0;

    interactions?.forEach((interaction: any) => {
        // Prioritize emotion_log (from story), fallback to article's processed emotion
        const emotion = interaction.emotion_log || interaction.articles?.emotion;
        if (emotion) {
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            totalEmotions++;
        }
    });

    const chartData = Object.entries(emotionCounts).map(([emotion, count]) => ({
        emotion,
        count
    })).sort((a, b) => b.count - a.count); // Sort by count descending

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen">
            <header className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPremium ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {isPremium ? 'PREMIUM' : 'FREE'}
                        </span>
                    </div>
                    <p className="text-gray-500 mt-1">반갑습니다, {user.email}</p>
                </div>

            </header>

            {!isPremium && (
                <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-blue-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg">프리미엄으로 업그레이드</h3>
                        <p className="text-blue-700 text-sm">무제한 스토리와 깊이 있는 감정 분석을 경험하세요.</p>
                    </div>
                    <Link href="/pricing" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md">
                        요금제 보기
                    </Link>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Reading History Column */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                        읽은 기사 목록
                        <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {interactions?.length || 0}
                        </span>
                    </h2>

                    {!interactions || interactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            <p>아직 읽은 기사가 없습니다.</p>
                            <div className="mt-4">
                                <Link href="/" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                                    기사 읽기
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {interactions.map((interaction: any) => (
                                <li key={interaction.id} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition border border-gray-100">
                                    <Link href={`/article/${interaction.article_id}`} className="block">
                                        <h3 className="font-semibold text-gray-900 line-clamp-1">{interaction.articles?.title || '알 수 없는 기사'}</h3>

                                        {interaction.user_opinion && (
                                            <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100 italic">
                                                "{interaction.user_opinion}"
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mt-2 text-xs">
                                            <span className="capitalize text-gray-500">{interaction.emotion_log?.replace('_', ' ')}</span>
                                            <span className="text-gray-400">{new Date(interaction.completed_at).toLocaleDateString()}</span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Emotional Journey Column */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">나의 감정 여정</h2>
                        <EmotionChart data={chartData} total={totalEmotions} />
                    </div>

                    <PremiumAnalysis
                        isPremium={isPremium}
                        recentEmotions={interactions?.map((i: any) => ({
                            emotion: i.emotion_log || i.articles?.emotion || 'neutral',
                            date: i.completed_at
                        })) || []}
                    />
                </div>
            </div>

            <div className="mt-8 text-right">
                <form action="/auth/signout" method="post">
                    <button className="text-red-500 hover:text-red-700 text-sm font-medium">
                        로그아웃
                    </button>
                </form>
            </div>
        </div>
    );
}
