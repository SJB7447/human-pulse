'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import DeleteArticleButton from '@/components/admin/DeleteArticleButton';

interface Article {
    id: string;
    title: string;
    emotion: string;
    created_at: string;
    published: boolean;
}

export default function ArticleTable({ articles }: { articles: Article[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800">최근 기사 목록</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="기사 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3">제목</th>
                            <th className="px-6 py-3">감정</th>
                            <th className="px-6 py-3">작성일</th>
                            <th className="px-6 py-3">상태</th>
                            <th className="px-6 py-3">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredArticles.map((article) => (
                            <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{article.title}</td>
                                <td className="px-6 py-4 text-xs">
                                    <span className={`px-2 py-1 rounded border ${article.emotion.includes('red') ? 'bg-red-50 text-red-700 border-red-100' :
                                        article.emotion.includes('blue') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            article.emotion.includes('green') ? 'bg-green-50 text-green-700 border-green-100' :
                                                article.emotion.includes('yellow') ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    'bg-gray-50 text-gray-700 border-gray-100'
                                        }`}>
                                        {article.emotion.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                    {new Date(article.created_at).toLocaleDateString('ko-KR')}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${article.published
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {article.published ? '발행됨' : '초안'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <Link
                                        href={`/admin/articles/${article.id}/edit`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                    >
                                        수정
                                    </Link>
                                    <DeleteArticleButton id={article.id} title={article.title} />
                                </td>
                            </tr>
                        ))}
                        {filteredArticles.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    {searchTerm ? '검색 결과가 없습니다.' : '기사가 없습니다. 첫 번째 기사를 작성해보세요!'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
