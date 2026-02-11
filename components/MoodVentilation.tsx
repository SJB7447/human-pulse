'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOOD_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes

export default function MoodVentilation() {
    const [showNudge, setShowNudge] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setShowNudge(true);
            // Auto-hide after 10 seconds if not interacted with
            setTimeout(() => setShowNudge(false), 10000);
        }, MOOD_CHECK_INTERVAL);

        return () => clearInterval(timer);
    }, []);

    return (
        <AnimatePresence>
            {showNudge && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
                >
                    {/* Peripheral Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-200/30 via-transparent to-pink-200/30 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-200/30 mix-blend-multiply" />

                    <div className="relative z-10 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 text-center max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Time for a Breather? 🌿</h3>
                        <p className="text-sm text-gray-600">
                            You've been reading for a while. Take a moment to look away and relax your eyes.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
