'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useMood } from '@/context/MoodContext';

const MoodBlackHole = dynamic(() => import('@/components/3d/MoodBlackHole'), { ssr: false });

const MOOD_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes
const NUDGE_START_TIME = 12 * 60 * 1000;    // 12 minutes

export default function MoodVentilation() {
    const { showPeripheralNudge, showFullVentilation, closeMoodVentilation } = useMood();
    const [isVenting, setIsVenting] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleClose = () => {
        setIsVenting(false);
        closeMoodVentilation();
    };

    if (!isClient) return null;

    return (
        <>
            <AnimatePresence>
                {showPeripheralNudge && !showFullVentilation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 60 }}
                        className="fixed inset-0 z-[90] pointer-events-none"
                    >
                        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(99,102,241,0.3)] md:shadow-[inset_0_0_200px_rgba(99,102,241,0.4)] transition-all duration-1000" />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showFullVentilation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-8 right-8 text-white/50 hover:text-white z-20 text-sm border border-white/20 rounded-full px-6 py-2 hover:bg-white/10 transition tracking-widest uppercase"
                        >
                            Close
                        </button>

                        <div className="absolute inset-0 z-0">
                            <MoodBlackHole isVenting={isVenting} />
                        </div>

                        <div className="relative z-10 text-center select-none p-8">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-5xl font-thin text-white mb-8 tracking-[0.2em]"
                            >
                                {isVenting ? "RELEASE" : "BREATHE"}
                            </motion.h2>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onMouseDown={() => setIsVenting(true)}
                                onMouseUp={() => setIsVenting(false)}
                                onMouseLeave={() => setIsVenting(false)}
                                className={`
                                    w-64 h-64 rounded-full border border-white/10 
                                    flex items-center justify-center 
                                    text-white/80 font-light tracking-widest text-lg
                                    backdrop-blur-sm transition-all duration-500
                                    ${isVenting ? 'bg-red-500/20 shadow-[0_0_100px_rgba(239,68,68,0.3)] border-red-500/30' : 'bg-white/5 hover:bg-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)]'}
                                `}
                            >
                                {isVenting ? "VENTING..." : "HOLD TO VENT"}
                            </motion.button>

                            <p className="mt-8 text-white/40 font-light text-sm tracking-wide">
                                Press and hold the circle to release negative energy
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
