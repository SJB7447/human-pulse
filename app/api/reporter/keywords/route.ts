import { genAI, TEXT_MODEL_NAME, extractText } from '@/lib/gemini';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const KEYWORD_PROMPT = `
당신은 숙련된 뉴스 리서치 전문가입니다. 
사용자가 입력한 주제/토픽을 분석하여 기사 작성에 도움이 되는 키워드와 관련 정보를 제공하세요.

출력 형식 (JSON):
{
    "main_keywords": ["핵심 키워드 5개"],
    "related_topics": ["연관 주제 3개"],
    "suggested_angles": ["기사 작성 시 접근할 수 있는 시각/앵글 3개"],
    "trending_context": "현재 이 주제가 왜 중요한지 1-2문장으로 설명"
}

반드시 한국어로 응답하세요.
`;

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        if (!genAI) return NextResponse.json({ error: 'AI 서비스를 사용할 수 없습니다.' }, { status: 503 });

        const { topic } = await req.json();
        if (!topic || topic.trim().length < 2) {
            return NextResponse.json({ error: '주제를 2글자 이상 입력하세요.' }, { status: 400 });
        }

        const prompt = `${KEYWORD_PROMPT}\n\n주제: ${topic}`;
        const result = await genAI.models.generateContent({ model: TEXT_MODEL_NAME, contents: prompt });
        const text = extractText(result);
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(cleanText);
            return NextResponse.json(jsonResponse);
        } catch {
            return NextResponse.json({ error: 'AI 응답 파싱 실패', raw: text }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Keyword API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
