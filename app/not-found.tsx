import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h1 className="text-9xl font-black text-gray-200">404</h1>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Overlay Content */}
                    <div className="pointer-events-auto">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">페이지를 찾을 수 없습니다</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                            찾으시는 감정의 실타래가 풀린 것 같습니다.<br />
                            페이지가 존재하지 않거나 이동되었을 수 있습니다.
                        </p>
                        <Link
                            href="/"
                            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        >
                            홈으로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
