'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    ⚠️
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
                <p className="text-gray-500 mb-6">
                    We apologize for the inconvenience. The error has been logged.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                        Try Again
                    </button>
                    <a href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg transition">
                        Go Home
                    </a>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 text-left bg-gray-100 p-4 rounded-lg overflow-auto max-h-48 text-xs font-mono text-red-800">
                        <p className="font-bold underline mb-1">Error Details:</p>
                        {error.message}
                        {error.digest && <p className="mt-1 text-gray-500">Digest: {error.digest}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
