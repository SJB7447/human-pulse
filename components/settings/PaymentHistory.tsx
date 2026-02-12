'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

interface Order {
    id: string;
    amount: number;
    status: string;
    created_at: string;
}

export default function PaymentHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setOrders(data);
            setLoading(false);
        };

        fetchOrders();
    }, [supabase]);

    if (loading) return <div className="p-4 text-center text-gray-500">로딩 중...</div>;
    if (orders.length === 0) return <div className="p-4 text-center text-gray-500 text-sm">결제 내역이 없습니다.</div>;

    return (
        <div className="bg-white/50 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">결제 내역</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3">날짜</th>
                            <th className="px-4 py-3">금액</th>
                            <th className="px-4 py-3">상태</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-4 py-3 text-gray-600">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {order.amount.toLocaleString()}원
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize
                                        ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'canceled' ? 'bg-gray-100 text-gray-600' :
                                                'bg-yellow-100 text-yellow-700'}
                                    `}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
