import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import FeedbackActions from './FeedbackActions';

export default async function AdminFeedbackPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch interactions with opinions
    const { data: feedbacks, error } = await supabase
        .from('interactions')
        .select(`
            id,
            user_opinion,
            emotion_log,
            created_at,
            profiles (username, full_name),
            articles (id, title, emotion)
        `)
        .not('user_opinion', 'is', null) // Only show items with opinions
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="p-6 text-red-500">Error fetching feedback: {error.message}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">피드백 / 의견 모음</h2>

            <div className="grid gap-6">
                {feedbacks?.map((item: any) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    <Link href={`/article/${item.articles?.id}`} className="hover:text-blue-600 hover:underline">
                                        {item.articles?.title || 'Unknown Article'}
                                    </Link>
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="font-medium text-gray-700">
                                        {item.profiles?.username || item.profiles?.full_name || 'Anonymous'}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(item.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${item.emotion_log?.includes('red') ? 'bg-red-100 text-red-700' :
                                item.emotion_log?.includes('blue') ? 'bg-blue-100 text-blue-700' :
                                    item.emotion_log?.includes('green') ? 'bg-green-100 text-green-700' :
                                        item.emotion_log?.includes('yellow') ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                }`}>
                                {item.emotion_log?.replace('_', ' ') || 'No Emotion'}
                            </div>
                        </div>

                        <div className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-100 flex justify-between gap-4">
                            <p className="text-gray-800 italic leading-relaxed">
                                "{item.user_opinion}"
                            </p>
                            <div className="flex-shrink-0">
                                <FeedbackActions interactionId={item.id} />
                            </div>
                        </div>
                    </div>
                ))}

                {feedbacks?.length === 0 && (
                    <div className="p-12 text-center bg-white rounded-xl border border-gray-200 text-gray-500">
                        아직 등록된 사용자 의견이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
