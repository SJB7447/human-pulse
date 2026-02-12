'use client';

import { deleteArticle } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteArticleButton({ id, title }: { id: string, title: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm(`"${title}" 기사를 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteArticle(id);
            // Router refresh is handled by server action revalidatePath somewhat, 
            // but client refresh ensures UI sync if needed.
            router.refresh();
        } catch (error) {
            alert('기사 삭제에 실패했습니다.');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition disabled:opacity-50"
            title="기사 삭제"
        >
            {isDeleting ? <span className="text-xs">처리 중...</span> : <Trash2 size={18} />}
        </button>
    );
}
