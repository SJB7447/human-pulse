import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ArticleClient from './ArticleClient'; // We'll move the client logic here

import { Metadata, ResolvingMetadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = (await params).id
    const supabase = await createClient()

    const { data: article } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()

    if (!article) {
        return {
            title: 'Article Not Found | Human Pulse',
        }
    }

    const previousImages = (await parent).openGraph?.images || []

    // Use article's image_url if available, otherwise a reliable placeholder or site default
    const primaryImage = article.image_url || `https://placehold.co/1200x630/png?text=${encodeURIComponent(article.title)}`

    return {
        title: `${article.title} | Human Pulse`,
        description: article.summary || article.content.substring(0, 160),
        openGraph: {
            title: article.title,
            description: article.summary,
            images: [primaryImage, ...previousImages],
            type: 'article',
            publishedTime: article.created_at,
            section: article.emotion,
            tags: article.keywords,
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.summary,
            images: [primaryImage],
        },
    }
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: article } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

    if (!article) {
        notFound();
    }

    return <ArticleClient article={article} />;
}
