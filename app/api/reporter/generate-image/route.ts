import { genAI, IMAGE_MODEL_NAME } from '@/lib/gemini';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        if (!genAI) return NextResponse.json({ error: 'AI 서비스를 사용할 수 없습니다.' }, { status: 503 });

        const { prompt } = await req.json();
        if (!prompt || prompt.trim().length < 5) {
            return NextResponse.json({ error: '이미지 설명을 5자 이상 입력하세요.' }, { status: 400 });
        }

        const imagePrompt = `Create a high-quality, professional news article header image. 
Style: Cinematic, photorealistic, editorial photography. 
Subject: ${prompt}
Do NOT include any text or watermarks in the image.`;

        let imageBase64 = null;
        let mimeType = 'image/png';

        try {
            // Attempt to use Imagen 3 via Google GenAI SDK
            // Note: The method signature for image generation in @google/genai may vary. 
            // We attempt standard generation. If it fails (e.g. 404 model not found), we catch and use fallback.
            // Check if generateImages exists on models (it should in new SDK)
            if (genAI.models.generateImages) {
                const response = await genAI.models.generateImages({
                    model: IMAGE_MODEL_NAME,
                    prompt: imagePrompt,
                    config: { numberOfImages: 1 }
                });

                // Response structure for generateImages:
                // response.generatedImages[0].image.imageBytes (base64 string)
                if (response?.generatedImages?.[0]?.image?.imageBytes) {
                    imageBase64 = response.generatedImages[0].image.imageBytes;
                }
            } else {
                // Warning: Method might not exist in this SDK version or requires different call
                console.warn('generateImages method not found on genAI.models');
            }
        } catch (genError) {
            console.warn('Gemini/Imagen generation failed, falling back to Pollinations:', genError);
            // Fallback proceeds below
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
