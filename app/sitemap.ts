import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://human-pulse.vercel.app';

    // Get all published articles
    const { data: articles } = await supabase
        .from('articles')
        .select('id, created_at')
        .eq('published', true);

    const articleEntries: MetadataRoute.Sitemap = (articles || []).map((article) => ({
        url: `${baseUrl}/article/${article.id}`,
        lastModified: new Date(article.created_at),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...articleEntries,
    ];
}
