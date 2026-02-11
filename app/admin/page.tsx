'use client';

import { useState } from 'react';

// Mock stats
const STATS = [
    { label: 'Total Articles', value: '1,234' },
    { label: 'Interactive Views', value: '45.2K' },
    { label: 'Avg. Engagement', value: '4m 12s' },
    { label: 'AI Success Rate', value: '98.5%' },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {STATS.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        {['Overview', 'Reported Content', 'AI Logs'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.toLowerCase()
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6 h-64 flex items-center justify-center text-gray-400">
                    Content for {activeTab} will appear here.
                </div>
            </div>
        </div>
    );
}
