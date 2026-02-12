'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { PenTool, FileText, ArrowLeft, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/Toast';

export default function ReporterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { showToast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                showToast('로그인이 필요합니다.', 'error');
                router.replace('/login');
                return;
            }

            const role = user.user_metadata?.role;
            if (role !== 'reporter' && role !== 'admin') {
                showToast('기자단 접근 권한이 없습니다.', 'error');
                router.replace('/');
                return;
            }

            setIsAuthorized(true);
        };

        checkAuth();
    }, [router, showToast]);

    if (!isAuthorized) {
        return null; // or a loading spinner
    }

    const navItems = [
        { href: '/reporter', label: '기사 작성', icon: PenTool },
        { href: '/reporter/my-articles', label: '내 기사', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200/60 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div className="p-6 border-b border-gray-100/60">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                기자단
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">Reporter Dashboard</p>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                            <ArrowLeft size={20} />
                        </button>
                    </div>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100/60">
                    <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <ArrowLeft size={16} />
                        메인으로 돌아가기
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-200/60 p-4 flex items-center">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500">
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">기자단</span>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
