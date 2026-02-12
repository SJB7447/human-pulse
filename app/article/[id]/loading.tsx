export default function ArticleLoading() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Image skeleton */}
                <div className="h-72 w-full bg-gray-200 rounded-3xl mb-8 animate-pulse" />
                {/* Title skeleton */}
                <div className="h-10 w-3/4 bg-gray-200 rounded-lg mb-4 animate-pulse" />
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                </div>
                {/* Content skeleton */}
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${85 + Math.random() * 15}%` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
