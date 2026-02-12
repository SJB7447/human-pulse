import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import UserActions from './UserActions';

export default async function AdminUsersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="p-6 text-red-500">Error fetching users: {error.message}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">사용자 관리</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">사용자 (ID/닉네임)</th>
                                <th className="px-6 py-4">구독 상태</th>
                                <th className="px-6 py-4">플랜</th>
                                <th className="px-6 py-4">가입일</th>
                                <th className="px-6 py-4">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {profiles?.map((profile) => (
                                <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {profile.username || 'No Nickname'}
                                        </div>
                                        <div className="text-xs text-gray-400 font-mono mt-1">
                                            {profile.id}
                                        </div>
                                        {profile.full_name && (
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {profile.full_name}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${profile.subscription_status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {profile.subscription_status || 'inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 capitalize text-gray-600">
                                        {profile.subscription_plan || 'Free'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(profile.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <UserActions userId={profile.id} status={profile.subscription_status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {profiles?.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        등록된 사용자가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
