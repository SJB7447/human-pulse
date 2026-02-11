import { getEmotionColor, EmotionType } from '@/utils/emotions';
import Link from 'next/link';

// Mock data for initial testing
const MOCK_NEWS = [
  {
    id: '1',
    title: 'New AI Policy Framework Announced',
    summary: 'Government unveils comprehensive guidelines for ethical AI development.',
    emotion: 'political_red' as EmotionType,
    category: 'Politics',
  },
  {
    id: '2',
    title: 'Global Markets Rally on Tech Earnings',
    summary: 'Major indices hit record highs as tech giants report strong quarterly results.',
    emotion: 'economic_blue' as EmotionType,
    category: 'Economy',
  },
  {
    id: '3',
    title: 'Urban Gardens Improving City Air Quality',
    summary: 'New study shows significant reduction in pollutants due to rooftop gardens.',
    emotion: 'environmental_green' as EmotionType,
    category: 'Environment',
  },
  {
    id: '4',
    title: 'Local Hero Saves Stranded Puppy',
    summary: 'Firefighter risks safety to rescue dog from storm drain.',
    emotion: 'lifestyle_yellow' as EmotionType,
    category: 'Lifestyle',
  },
  {
    id: '5',
    title: 'Memorial Service Held for Accident Victims',
    summary: 'Community gathers to pay respects to the lost lives.',
    emotion: 'tragic_gray' as EmotionType,
    category: 'Society',
  },
];

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Human Pulse
        </h1>
        <p className="text-gray-500">Interactive News for Emotional Balance</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {MOCK_NEWS.map((news) => {
          const colors = getEmotionColor(news.emotion);
          return (
            <div
              key={news.id}
              className={`p-6 rounded-xl border ${colors.bg} ${colors.border} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${colors.accent}`}>
                  {news.category}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {news.emotion.replace('_', ' ')}
                </span>
              </div>
              <h2 className={`text-xl font-bold mb-2 ${colors.text}`}>
                {news.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {news.summary}
              </p>
              <div className="mt-auto">
                <Link href={`/article/${news.id}`} className={`text-sm font-semibold underline decoration-2 underline-offset-4 decoration-transparent hover:${colors.text}/50 transition-colors`}>
                  Read Interactive Story &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
