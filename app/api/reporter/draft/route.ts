import { model } from '@/lib/gemini';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const DRAFT_PROMPT = `
당신은 전문 뉴스 기자입니다. 아래 정보를 바탕으로 완성도 높은 뉴스 기사를 한국어로 작성하세요.

작성 규칙:
1. 기사는 역피라미드 구조 (가장 중요한 정보를 먼저)로 작성합니다.
2. 제목은 클릭을 유도하면서도 정확한 정보를 전달해야 합니다.
3. 리드(첫 문단)에 누가, 무엇을, 언제, 어디서, 왜, 어떻게를 포함합니다.
4. 본문은 최소 5개 문단, 800자 이상으로 작성합니다.
5. 객관적이고 전문적인 톤을 유지합니다.
6. 인용구나 전문가 의견이 있으면 자연스럽게 포함합니다.

출력 형식 (JSON):
{
    "title": "기사 제목",
    "content": "기사 본문 (마크다운 형식)",
    "summary": "기사 요약 1-2문장",
    "keywords": ["키워드1", "키워드2", "키워드3"],
    "emotion": "political_red | economic_blue | environmental_green | lifestyle_yellow | tragic_gray"
}
`;

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        if (!model) return NextResponse.json({ error: 'AI 서비스를 사용할 수 없습니다.' }, { status: 503 });

        const { keywords, outline, topic } = await req.json();
        if (!topic && !keywords) {
            return NextResponse.json({ error: '주제 또는 키워드를 입력하세요.' }, { status: 400 });
        }

        let context = `주제: ${topic || ''}`;
        if (keywords) context += `\n핵심 키워드: ${keywords}`;
        if (outline) context += `\n기사 개요/방향: ${outline}`;

        const prompt = `${DRAFT_PROMPT}\n\n${context}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(cleanText);
            return NextResponse.json(jsonResponse);
        } catch {
            return NextResponse.json({ error: 'AI 응답 파싱 실패', raw: text }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Draft API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
