import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Menu, X, User, LogOut } from 'lucide-react';

export default async function Navbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 group-hover:opacity-80 transition">
                            Human Pulse
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                            뉴스
                        </Link>
                        <Link href="/community" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition flex items-center gap-1">
                            커뮤니티
                        </Link>
                        <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                            이용권
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/mypage"
                                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
                                >
                                    <User size={18} />
                                    마이페이지
                                </Link>

                                <Link
                                    href="/reporter"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                                >
                                    기자단
                                </Link>

                                {user.user_metadata?.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        className="text-sm font-medium text-purple-600 hover:text-purple-800 transition"
                                    >
                                        관리자
                                    </Link>
                                )}

                                <div className="h-4 w-px bg-gray-200"></div>

                                <form action="/auth/signout" method="post">
                                    <button className="text-sm font-medium text-red-500 hover:text-red-700 transition flex items-center gap-1">
                                        로그아웃
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                                    로그인
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition shadow-sm hover:shadow"
                                >
                                    회원가입
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button (Placeholder for now, could be interactive client component if needed) */}
                    <div className="md:hidden flex items-center">
                        <Link href="/mypage" className="p-2 text-gray-600">
                            <User size={24} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Links (Simple inline for now) */}
            <div className="md:hidden border-t border-gray-100 flex justify-around py-3 bg-white/50 backdrop-blur-sm">
                <Link href="/" className="text-xs font-medium text-gray-600 flex flex-col items-center gap-1">
                    <span>뉴스</span>
                </Link>
                <Link href="/community" className="text-xs font-medium text-gray-600 flex flex-col items-center gap-1">
                    <span>커뮤니티</span>
                </Link>
                <Link href="/pricing" className="text-xs font-medium text-gray-600 flex flex-col items-center gap-1">
                    <span>이용권</span>
                </Link>
            </div>
        </nav>
    );
}
