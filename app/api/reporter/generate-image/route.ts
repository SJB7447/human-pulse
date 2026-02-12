import { imageModel } from '@/lib/gemini';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        if (!imageModel) return NextResponse.json({ error: 'AI 서비스를 사용할 수 없습니다.' }, { status: 503 });

        const { prompt } = await req.json();
        if (!prompt || prompt.trim().length < 5) {
            return NextResponse.json({ error: '이미지 설명을 5자 이상 입력하세요.' }, { status: 400 });
        }

        const imagePrompt = `Create a high-quality, professional news article header image. 
Style: Cinematic, photorealistic, editorial photography. 
Subject: ${prompt}
Do NOT include any text or watermarks in the image.`;

        const result = await imageModel.generateContent(imagePrompt);
        const response = await result.response;

        // Check for inline image data in the response
        const parts = response.candidates?.[0]?.content?.parts || [];
        let imageBase64 = null;
        let mimeType = 'image/png';

        for (const part of parts) {
            if (part.inlineData) {
                imageBase64 = part.inlineData.data;
                mimeType = part.inlineData.mimeType || 'image/png';
                break;
            }
        }

        if (!imageBase64) {
            // Fallback: Use Pollinations.ai if Gemini image gen fails
            const cleanPrompt = encodeURIComponent(prompt.slice(0, 100) + ", cinematic lighting, high quality, news photography, 4k");
            const seed = Math.floor(Math.random() * 1000);
            const fallbackUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1280&height=720&seed=${seed}&nologo=true`;

            return NextResponse.json({
                image_url: fallbackUrl,
                source: 'pollinations_fallback'
            });
        }

        // Upload base64 image to Supabase Storage
        const fileName = `article-${Date.now()}.png`;
        const buffer = Buffer.from(imageBase64, 'base64');

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('article-images')
            .upload(fileName, buffer, {
                contentType: mimeType,
                upsert: true,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            // Fallback: return as data URI
            return NextResponse.json({
                image_url: `data:${mimeType};base64,${imageBase64}`,
                source: 'gemini_base64'
            });
        }

        const { data: publicUrl } = supabase.storage
            .from('article-images')
            .getPublicUrl(fileName);

        return NextResponse.json({
            image_url: publicUrl.publicUrl,
            source: 'gemini'
        });

    } catch (error: any) {
        console.error('Image Generation Error:', error);

        // Fallback to Pollinations on any error
        try {
            const { prompt } = await req.clone().json();
            const cleanPrompt = encodeURIComponent((prompt || 'news').slice(0, 100) + ", cinematic, 4k");
            const seed = Math.floor(Math.random() * 1000);
            const fallbackUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1280&height=720&seed=${seed}&nologo=true`;
            return NextResponse.json({ image_url: fallbackUrl, source: 'pollinations_fallback' });
        } catch {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}
