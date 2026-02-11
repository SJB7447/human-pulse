'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import InteractiveStory from '@/components/InteractiveStory';

// Mock data (same as Home page for now)
const MOCK_NEWS_CONTENT = {
    '1': {
        title: 'New AI Policy Framework Announced',
        content: 'The government has today unveiled a comprehensive framework for ethocal AI development. This explicitly bans autonomous weaponry and sets strict guidelines for data privacy...'
    },
    '2': {
        title: 'Global Markets Rally',
        content: 'Stock markets across Asia and Europe surged today following positive earnings reports from major tech conglomerates...'
    }
};

export default function ArticlePage() {
    const params = useParams();
    const id = params?.id as string;
    const article = MOCK_NEWS_CONTENT[id as keyof typeof MOCK_NEWS_CONTENT] || { title: 'Article Not Found', content: '...' };

    const [isLoading, setIsLoading] = useState(false);
    const [story, setStory] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const generateStory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: article.content }),
            });

            if (!res.ok) throw new Error('Failed to generate story');

            const data = await res.json();
            setStory(data);
        } catch (err) {
            setError('Failed to generate interactive story. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen">
            <div className="mb-6">
                <a href="/" className="text-gray-500 hover:text-gray-900">&larr; Back to Feed</a>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-gray-900">{article.title}</h1>

            {!story && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <p className="text-gray-700 leading-relaxed mb-6">
                        {article.content}
                    </p>
                    <div className="flex justify-center">
                        <button
                            onClick={generateStory}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating Experience...
                                </>
                            ) : (
                                <>
                                    ✨ Experience this Story
                                </>
                            )}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
                </div>
            )}

            {story && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <InteractiveStory story={story} />
                </motion.div>
            )}
        </div>
    );
}
