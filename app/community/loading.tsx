export default function CommunityLoading() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="h-10 w-40 bg-gray-200 rounded-lg mb-6 animate-pulse" />
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="h-5 w-3/4 bg-gray-200 rounded mb-3 animate-pulse" />
                            <div className="h-4 w-full bg-gray-100 rounded mb-2 animate-pulse" />
                            <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
