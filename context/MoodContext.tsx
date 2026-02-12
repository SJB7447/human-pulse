'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface MoodContextType {
    showPeripheralNudge: boolean;
    showFullVentilation: boolean;
    resetMoodTimer: () => void;
    closeMoodVentilation: () => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

const MOOD_CHECK_INTERVAL = 15 * 60; // 15 minutes in seconds
const NUDGE_START_TIME = 12 * 60;    // 12 minutes in seconds

export function MoodProvider({ children }: { children: React.ReactNode }) {
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [showPeripheralNudge, setShowPeripheralNudge] = useState(false);
    const [showFullVentilation, setShowFullVentilation] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsElapsed(prev => {
                const newTime = prev + 1;

                // Trigger Nudge
                if (newTime === NUDGE_START_TIME) {
                    setShowPeripheralNudge(true);
                }

                // Trigger Full Ventilation
                if (newTime >= MOOD_CHECK_INTERVAL) {
                    setShowFullVentilation(true);
                    setShowPeripheralNudge(false);
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const resetMoodTimer = () => {
        setSecondsElapsed(0);
        setShowPeripheralNudge(false);
        setShowFullVentilation(false);
    };

    const closeMoodVentilation = () => {
        // Just close the modal, maybe pause timer or reset?
        // Let's reset for now to restart the 15-min cycle
        resetMoodTimer();
    };

    return (
        <MoodContext.Provider value={{ showPeripheralNudge, showFullVentilation, resetMoodTimer, closeMoodVentilation }}>
            {children}
        </MoodContext.Provider>
    );
}

export function useMood() {
    const context = useContext(MoodContext);
    if (context === undefined) {
        throw new Error('useMood must be used within a MoodProvider');
    }
    return context;
}
