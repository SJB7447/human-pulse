import { createClient } from '@/utils/supabase/server';
import { getEmotionColor, EmotionType } from '@/utils/emotions';
import Link from 'next/link';
import HeroBackground from '@/components/3d/HeroBackground';

export const revalidate = 60; // Enable ISR (60 seconds)

export default async function Home() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <HeroBackground />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <header className="mb-20 text-center mt-12 bg-white/30 backdrop-blur-md p-12 rounded-3xl border border-white/50 shadow-xl">
          <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6 tracking-tight drop-shadow-sm">
            Human Pulse
          </h1>
          <p className="text-2xl text-gray-700 font-light leading-relaxed">
            감정의 파동을 시각화하는 <br className="md:hidden" />
            <span className="font-semibold text-gray-900">AI 인터랙티브 저널리즘</span>
          </p>
          <div className="mt-8">
            <Link href="#latest-news" className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-xl hover:-translate-y-1">
              최신 기사 탐험하기
            </Link>
          </div>
        </header>

        <div id="latest-news" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles?.map((news) => {
            const colors = getEmotionColor(news.emotion as EmotionType);
            return (
              <div
                key={news.id}
                className={`group relative overflow-hidden rounded-3xl border-2 ${colors.border} bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col`}
              >
                {/* Dynamic Image Background/Section */}
                <div className="relative h-60 w-full bg-gray-200 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={news.image_url || `https://image.pollinations.ai/prompt/${encodeURIComponent((news.keywords?.[0] || news.title || 'news').slice(0, 60))}?width=800&height=600&nologo=true`}
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.classList.add(colors.accent);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white ${colors.accent} backdrop-blur-md shadow-lg uppercase tracking-wide`}>
                    {news.keywords?.[0] || '뉴스'}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold bg-gray-100 px-2 py-1 rounded">
                      {news.emotion.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(news.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className={`text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2`}>
                    {news.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {news.summary}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <Link href={`/article/${news.id}`} className={`text-sm font-bold flex items-center justify-between ${colors.text} hover:opacity-70 transition-opacity group-hover:translate-x-1 duration-300`}>
                      인터랙티브 스토리 읽기 <span className="text-lg">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {(!articles || articles.length === 0) && (
            <div className="col-span-full text-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-gray-200 shadow-inner">
              <div className="text-6xl mb-4 animate-bounce">📭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">아직 등록된 기사가 없습니다</h3>
              <p className="text-gray-500 mb-6">AI 기자가 데이터를 수집하고 있습니다...</p>
              <Link href="/admin" className="px-6 py-2 bg-blue-100 text-blue-700 rounded-full font-bold hover:bg-blue-200 transition">
                관리자 로그인
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
