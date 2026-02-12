'use client';

import { useState } from 'react';
import { deleteFeedback } from '../actions';
import { useToast } from '@/components/ui/Toast';
import { Trash2 } from 'lucide-react';

export default function FeedbackActions({ interactionId }: { interactionId: string }) {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleDelete = async () => {
        if (!confirm('이 피드백 내용을 삭제하시겠습니까? (복구 불가)')) return;

        setLoading(true);
        const res = await deleteFeedback(interactionId);

        if (res.success) {
            showToast('피드백이 삭제되었습니다.', 'success');
        } else {
            showToast('삭제 실패: ' + res.error, 'error');
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition"
            title="의견 삭제"
        >
            {loading ? (
                <span className="text-xs">Processing...</span>
            ) : (
                <Trash2 size={16} />
            )}
        </button>
    );
}
