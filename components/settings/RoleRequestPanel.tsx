'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Shield, Newspaper, Clock, CheckCircle, XCircle } from 'lucide-react';

interface RoleRequest {
    id: string;
    requested_role: string;
    reason: string;
    status: string;
    created_at: string;
}

export default function RoleRequestPanel() {
    const [requests, setRequests] = useState<RoleRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState<'reporter' | 'admin' | null>(null);
    const [reason, setReason] = useState('');
    const [userRole, setUserRole] = useState<string>('subscriber');
    const { showToast } = useToast();

    useEffect(() => {
        fetchRequests();
        fetchUserRole();
    }, []);

    const fetchUserRole = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserRole(user.user_metadata?.role || 'subscriber');
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/role-request');
            const data = await res.json();
            if (data.requests) setRequests(data.requests);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (role: 'reporter' | 'admin') => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/role-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, reason }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast(`${role === 'reporter' ? '기자단' : '관리자'} 인증 요청이 제출되었습니다.`, 'success');
            setShowForm(null);
            setReason('');
            fetchRequests();
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const hasPending = (role: string) => requests.some(r => r.requested_role === role && r.status === 'pending');
    const isAlreadyRole = (role: string) => userRole === role;

    const statusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><Clock size={12} /> 대기 중</span>;
            case 'approved':
                return <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle size={12} /> 승인됨</span>;
            case 'rejected':
                return <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full"><XCircle size={12} /> 거절됨</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">역할 인증 요청</h3>

            {/* Request Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Reporter Request */}
                <button
                    onClick={() => setShowForm(showForm === 'reporter' ? null : 'reporter')}
                    disabled={hasPending('reporter') || isAlreadyRole('reporter')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${isAlreadyRole('reporter')
                            ? 'border-green-200 bg-green-50 cursor-default'
                            : hasPending('reporter')
                                ? 'border-amber-200 bg-amber-50 cursor-default'
                                : showForm === 'reporter'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAlreadyRole('reporter') ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                        <Newspaper size={20} className="text-white" />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">기자단 인증</div>
                        <div className="text-xs text-gray-500">
                            {isAlreadyRole('reporter')
                                ? '✅ 이미 기자단입니다'
                                : hasPending('reporter')
                                    ? '⏳ 요청 대기 중'
                                    : '기사 작성 권한 요청'}
                        </div>
                    </div>
                </button>

                {/* Admin Request */}
                <button
                    onClick={() => setShowForm(showForm === 'admin' ? null : 'admin')}
                    disabled={hasPending('admin') || isAlreadyRole('admin')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${isAlreadyRole('admin')
                            ? 'border-green-200 bg-green-50 cursor-default'
                            : hasPending('admin')
                                ? 'border-amber-200 bg-amber-50 cursor-default'
                                : showForm === 'admin'
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAlreadyRole('admin') ? 'bg-green-500' : 'bg-purple-500'
                        }`}>
                        <Shield size={20} className="text-white" />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">관리자 인증</div>
                        <div className="text-xs text-gray-500">
                            {isAlreadyRole('admin')
                                ? '✅ 이미 관리자입니다'
                                : hasPending('admin')
                                    ? '⏳ 요청 대기 중'
                                    : '관리자 권한 요청'}
                        </div>
                    </div>
                </button>
            </div>

            {/* Request Form */}
            {showForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {showForm === 'reporter' ? '기자단' : '관리자'} 인증 요청 사유
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="인증 요청 사유를 입력하세요 (선택사항)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                        rows={3}
                    />
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={() => { setShowForm(null); setReason(''); }}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={() => handleSubmit(showForm)}
                            disabled={submitting}
                            className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition disabled:opacity-50 ${showForm === 'reporter'
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                        >
                            {submitting ? '요청 중...' : '인증 요청'}
                        </button>
                    </div>
                </div>
            )}

            {/* Request History */}
            {requests.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-3">요청 이력</h4>
                    <div className="space-y-2">
                        {requests.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    {req.requested_role === 'reporter' ? (
                                        <Newspaper size={16} className="text-blue-500" />
                                    ) : (
                                        <Shield size={16} className="text-purple-500" />
                                    )}
                                    <div>
                                        <span className="text-sm font-medium text-gray-800">
                                            {req.requested_role === 'reporter' ? '기자단' : '관리자'} 인증
                                        </span>
                                        {req.reason && (
                                            <p className="text-xs text-gray-500 mt-0.5">{req.reason}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {statusBadge(req.status)}
                                    <span className="text-xs text-gray-400">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
