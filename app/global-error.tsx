'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="ko">
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            ⚠️
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">시스템 오류 발생</h2>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            예기치 못한 오류가 발생했습니다.<br />
                            잠시 후 다시 시도해 주세요.
                        </p>
                        <button
                            onClick={() => reset()}
                            className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        >
                            페이지 새로고침
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
