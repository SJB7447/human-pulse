export default function ReporterLoading() {
    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar skeleton */}
            <div className="w-64 bg-gray-900/95 p-6 hidden md:block">
                <div className="h-8 w-32 bg-gray-700 rounded mb-2 animate-pulse" />
                <div className="h-4 w-24 bg-gray-800 rounded mb-8 animate-pulse" />
                <div className="space-y-3">
                    <div className="h-10 bg-gray-800 rounded-lg animate-pulse" />
                    <div className="h-10 bg-gray-800 rounded-lg animate-pulse" />
                </div>
            </div>
            {/* Content skeleton */}
            <div className="flex-1 p-8">
                <div className="h-10 w-48 bg-gray-200 rounded-lg mb-6 animate-pulse" />
                <div className="h-6 w-64 bg-gray-100 rounded mb-8 animate-pulse" />
                <div className="flex gap-3 mb-8">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-10 w-28 bg-gray-100 rounded-full animate-pulse" />
                    ))}
                </div>
                <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            </div>
        </div>
    );
}
