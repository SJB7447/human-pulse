'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, MessageSquare, Menu, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/Toast';

export default function AdminLayout({
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

            // Fetch role from profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            const role = profile?.role; // Use DB role, ignore text metadata which might be stale

            if (role !== 'admin') {
                showToast('관리자 접근 권한이 없습니다.', 'error');
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
        { href: '/admin', label: '대시보드', icon: LayoutDashboard },
        { href: '/admin/users', label: '사용자 관리', icon: Users },
        { href: '/admin/feedback', label: '피드백 / 의견', icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">Admin</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
                        <ArrowLeft size={20} />
                    </button>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 px-4 py-2">
                        <ArrowLeft size={16} />
                        메인으로 돌아가기
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500">
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold text-gray-900">Human Pulse Admin</span>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
