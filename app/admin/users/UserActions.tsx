'use client';

import { useState } from 'react';
import { banUser } from '../actions';
import { useToast } from '@/components/ui/Toast';

export default function UserActions({ userId, status }: { userId: string, status: string }) {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleBan = async () => {
        if (!confirm('정말 이 사용자를 차단하시겠습니까?')) return;

        setLoading(true);
        const res = await banUser(userId);

        if (res.success) {
            showToast('사용자가 차단되었습니다.', 'success');
        } else {
            showToast('차단 실패: ' + res.error, 'error');
        }
        setLoading(false);
    };

    if (status === 'banned') {
        return <span className="text-red-500 text-xs font-bold">차단됨</span>;
    }

    return (
        <button
            onClick={handleBan}
            disabled={loading}
            className="text-red-500 hover:text-red-700 text-xs font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition disabled:opacity-50"
        >
            {loading ? '처리중...' : '차단'}
        </button>
    );
}
