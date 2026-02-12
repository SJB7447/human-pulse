export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                {/* Animated Pulse Logo */}
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                    <div className="absolute inset-2 bg-purple-500 rounded-full opacity-40 animate-pulse"></div>
                    <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                    </div>
                </div>

                <p className="text-sm font-medium text-gray-500 animate-pulse">
                    Analyzing emotions...
                </p>
            </div>
        </div>
    );
}
