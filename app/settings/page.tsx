'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SubscriptionManager from '@/components/settings/SubscriptionManager';
import PaymentHistory from '@/components/settings/PaymentHistory';
import RoleRequestPanel from '@/components/settings/RoleRequestPanel';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'roles'>('profile');
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        avatar_url: '',
    });
    const [subscription, setSubscription] = useState({
        status: 'free',
        plan: null as string | null,
        periodEnd: null as string | null,
    });

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/login');
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('username, full_name, avatar_url, subscription_status, subscription_plan, current_period_end')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                if (data) {
                    setFormData({
                        username: data.username || '',
                        full_name: data.full_name || '',
                        avatar_url: data.avatar_url || '',
                    });
                    setSubscription({
                        status: data.subscription_status || 'free',
                        plan: data.subscription_plan,
                        periodEnd: data.current_period_end,
                    });
                }
            } catch (error: any) {
                showToast('프로필을 불러오는 중 오류가 발생했습니다: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [supabase, router, showToast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const updates = {
                id: user.id,
                username: formData.username,
                full_name: formData.full_name,
                avatar_url: formData.avatar_url,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;

            showToast("프로필이 성공적으로 업데이트되었습니다!", 'success');
            router.refresh();
        } catch (error: any) {
            showToast('업데이트 실패: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">설정 불러오는 중...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen">
            <header className="mb-10 mt-6">
                <Link href="/mypage" className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center gap-1 transition-colors">
                    &larr; 마이페이지로 돌아가기
                </Link>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">설정</h1>
                <p className="text-gray-500 mt-2 font-light text-lg">프로필 정보 및 구독 상태를 관리하세요.</p>
            </header>

            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    프로필 설정
                    {activeTab === 'profile' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('subscription')}
                    className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'subscription' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    구독 및 결제
                    {activeTab === 'subscription' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'roles' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    역할 인증
                    {activeTab === 'roles' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                </button>
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'profile' ? (
                    <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/60 space-y-8">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-8">
                            <div className="relative w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-md">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl text-gray-400 font-black">
                                        {formData.username ? formData.username.substring(0, 1).toUpperCase() : '?'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">프로필 이미지</h3>
                                <p className="text-sm text-gray-500 mb-3">이미지 URL을 입력하여 프로필 사진을 변경하세요.</p>
                                <input
                                    type="url"
                                    name="avatar_url"
                                    value={formData.avatar_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">닉네임</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="커뮤니티에서 사용할 이름"
                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">실명</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="홍길동"
                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {saving ? '저장 중...' : '변경사항 저장'}
                            </button>
                        </div>
                    </form>
                ) : activeTab === 'subscription' ? (
                    <div className="space-y-8">
                        <SubscriptionManager
                            status={subscription.status}
                            plan={subscription.plan}
                            periodEnd={subscription.periodEnd}
                        />
                        <PaymentHistory />
                    </div>
                ) : (
                    <RoleRequestPanel />
                )}
            </motion.div>
        </div>
    );
}
