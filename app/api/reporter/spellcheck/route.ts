import { model } from '@/lib/gemini';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const SPELLCHECK_PROMPT = `
당신은 한국어 맞춤법 및 문법 전문가입니다.
아래 텍스트의 맞춤법, 띄어쓰기, 문법 오류를 찾아 교정하세요.

출력 형식 (JSON):
{
    "corrected_text": "교정된 전체 텍스트",
    "corrections": [
        {
            "original": "원본 표현",
            "corrected": "교정된 표현",
            "reason": "교정 이유 (간단히)"
        }
    ],
    "score": 85,
    "feedback": "전체적인 문장 품질에 대한 한 줄 평가"
}

규칙:
1. 한국어 맞춤법 규정을 따릅니다.
2. 띄어쓰기 오류를 반드시 체크합니다.
3. 문맥에 맞지 않는 단어 사용도 지적합니다.
4. score는 0~100 사이의 점수입니다 (100 = 완벽).
`;

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        if (!model) return NextResponse.json({ error: 'AI 서비스를 사용할 수 없습니다.' }, { status: 503 });

        const { text } = await req.json();
        if (!text || text.trim().length < 10) {
            return NextResponse.json({ error: '10자 이상의 텍스트를 입력하세요.' }, { status: 400 });
        }

        const prompt = `${SPELLCHECK_PROMPT}\n\n교정할 텍스트:\n${text}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(cleanText);
            return NextResponse.json(jsonResponse);
        } catch {
            return NextResponse.json({ error: 'AI 응답 파싱 실패', raw: responseText }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Spellcheck API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
