'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Shield, Newspaper, Check, X, Clock } from 'lucide-react';

interface RoleRequest {
    id: string;
    user_id: string;
    requested_role: string;
    reason: string | null;
    status: string;
    created_at: string;
    reviewed_at: string | null;
    profiles?: { username: string | null; full_name: string | null };
}

export default function AdminRoleRequests() {
    const [requests, setRequests] = useState<RoleRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const { showToast } = useToast();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/role-requests');
            const data = await res.json();
            if (data.requests) setRequests(data.requests);
        } catch {
            showToast('요청 목록을 불러올 수 없습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
        setProcessing(requestId);
        try {
            const res = await fetch('/api/admin/role-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, action }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast(
                action === 'approve' ? '요청이 승인되었습니다.' : '요청이 거절되었습니다.',
                action === 'approve' ? 'success' : 'info'
            );
            fetchRequests();
        } catch (error: any) {
            showToast('처리 실패: ' + error.message, 'error');
        } finally {
            setProcessing(null);
        }
    };

    const filtered = requests.filter(r => filter === 'all' || r.status === filter);
    const pendingCount = requests.filter(r => r.status === 'pending').length;

    if (loading) {
        return <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">역할 인증 요청</h3>
                        {pendingCount > 0 && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                {pendingCount}건 대기
                            </span>
                        )}
                    </div>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${filter === f
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {f === 'pending' ? '대기' : f === 'approved' ? '승인' : f === 'rejected' ? '거절' : '전체'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    요청이 없습니다.
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {filtered.map((req) => (
                        <div key={req.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${req.requested_role === 'reporter' ? 'bg-blue-100' : 'bg-purple-100'
                                        }`}>
                                        {req.requested_role === 'reporter' ? (
                                            <Newspaper size={18} className="text-blue-600" />
                                        ) : (
                                            <Shield size={18} className="text-purple-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">
                                                {req.profiles?.username || req.profiles?.full_name || req.user_id.slice(0, 8)}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${req.requested_role === 'reporter'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'bg-purple-50 text-purple-600'
                                                }`}>
                                                {req.requested_role === 'reporter' ? '기자단' : '관리자'}
                                            </span>
                                        </div>
                                        {req.reason && (
                                            <p className="text-sm text-gray-500 mt-1">&ldquo;{req.reason}&rdquo;</p>
                                        )}
                                        <span className="text-xs text-gray-400 mt-1 block">
                                            {new Date(req.created_at).toLocaleDateString()} {new Date(req.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {req.status === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleAction(req.id, 'approve')}
                                                disabled={processing === req.id}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                                            >
                                                <Check size={14} /> 승인
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, 'reject')}
                                                disabled={processing === req.id}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                                            >
                                                <X size={14} /> 거절
                                            </button>
                                        </>
                                    ) : (
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${req.status === 'approved'
                                                ? 'bg-green-50 text-green-600'
                                                : 'bg-red-50 text-red-600'
                                            }`}>
                                            {req.status === 'approved' ? '✅ 승인됨' : '❌ 거절됨'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
