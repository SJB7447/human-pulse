'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, LogOut, PenTool, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface UserData {
    id: string;
    email?: string;
    user_metadata?: { role?: string };
}

export default function Navbar() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        const fetchUserRole = async (userId: string) => {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
            return profile?.role;
        };

        const initializeUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const role = await fetchUserRole(user.id);
                setUser({ ...user, user_metadata: { ...user.user_metadata, role } });
            } else {
                setUser(null);
            }
            setLoaded(true);
        };

        initializeUser();

        // Listen for auth changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const role = await fetchUserRole(session.user.id);
                setUser({ ...session.user, user_metadata: { ...session.user.user_metadata, role } });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

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
                        {!loaded ? (
                            <div className="w-20 h-8 bg-gray-100 rounded-full animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/mypage"
                                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
                                >
                                    <User size={18} />
                                    마이페이지
                                </Link>

                                {(user.user_metadata?.role === 'reporter' || user.user_metadata?.role === 'admin') && (
                                    <Link
                                        href="/reporter"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                                    >
                                        기자단
                                    </Link>
                                )}

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

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <Link href="/mypage" className="p-2 text-gray-600">
                            <User size={24} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="md:hidden border-t border-gray-100 flex justify-around py-3 bg-white/50 backdrop-blur-sm">
                <Link href="/" className="text-xs font-medium text-gray-600 flex flex-col items-center gap-1">
                    <span>뉴스</span>
                </Link>
                <Link href="/community" className="text-xs font-medium text-gray-600 flex flex-col items-center gap-1">
                    <span>커뮤니티</span>
                </Link>

                {(user?.user_metadata?.role === 'reporter' || user?.user_metadata?.role === 'admin') && (
                    <Link href="/reporter" className="text-xs font-medium text-blue-600 flex flex-col items-center gap-1">
                        <PenTool size={18} />
                        <span>기자단</span>
                    </Link>
                )}

                {user?.user_metadata?.role === 'admin' && (
                    <Link href="/admin" className="text-xs font-medium text-purple-600 flex flex-col items-center gap-1">
                        <LayoutDashboard size={18} />
                        <span>관리자</span>
                    </Link>
                )}

                <Link href="/pricing" className="text-xs font-medium text-gray-600 flex flex-col items-center gap-1">
                    <span>이용권</span>
                </Link>
            </div>
        </nav>
    );
}
