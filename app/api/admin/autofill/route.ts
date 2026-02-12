import { genAI, TEXT_MODEL_NAME, extractText } from '@/lib/gemini';
import { NextRequest, NextResponse } from 'next/server';

const AUTOFILL_PROMPT = `
Analyze the following news article content and provide structured metadata for a CMS.
Output Language: Korean(한국어)

Input: News Article Text

Output JSON Structure:
{
    "suggested_title": "기사의 내용을 잘 나타내는 매력적인 제목 (한국어)",
        "summary": "기사의 핵심 내용을 1-2문장으로 요약 (한국어)",
            "keywords": ["키워드1", "키워드2", "키워드3"],
                "emotion": "political_red" | "economic_blue" | "environmental_green" | "lifestyle_yellow" | "tragic_gray"
}

Rules:
1. "suggested_title": 뉴스 피드에 적합한 드라마틱하고 흥미로운 제목을 제안하세요.
2. "keywords": 가장 관련성 높은 명사구 3 - 5개를 추출하세요.
3. "emotion":
- political_red: 정치, 갈등, 긴급, 논쟁.
   - economic_blue: 경제, 시장, 기업, 기술.
   - environmental_green: 기후, 자연, 지속가능성, 건강(긍정적).
   - lifestyle_yellow: 엔터테인먼트, 문화, 휴먼 스토리, 기쁨.
   - tragic_gray: 사고, 사망, 재난, 슬픔.
`;

export async function POST(req: NextRequest) {
    try {
        if (!genAI) return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
        const { content } = await req.json();

        if (!content || content.length < 50) {
            return NextResponse.json({ error: 'Content is too short or missing' }, { status: 400 });
        }

        const prompt = `${AUTOFILL_PROMPT} \n\nArticle Content: \n${content} `;

        const result = await genAI.models.generateContent({ model: TEXT_MODEL_NAME, contents: prompt });
        const text = extractText(result);

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(cleanText);
            return NextResponse.json(jsonResponse);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 });
        }

    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
