'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEmotionColor, EmotionType } from '@/utils/emotions';

interface InteractiveStoryProps {
    story: any; // Type strictly later based on API response
}

export default function InteractiveStory({ story }: InteractiveStoryProps) {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const colors = getEmotionColor(story.emotion as EmotionType);

    const currentScene = story.scenes[currentSceneIndex];
    const isLastScene = currentSceneIndex === story.scenes.length - 1;

    const handleNext = () => {
        if (!isLastScene) {
            setCurrentSceneIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentSceneIndex > 0) {
            setCurrentSceneIndex((prev) => prev - 1);
        }
    };

    return (
        <div className={`max-w-2xl mx-auto p-6 rounded-3xl border-2 ${colors.border} ${colors.bg} shadow-lg relative overflow-hidden`}>
            <h2 className={`text-2xl font-bold mb-4 ${colors.text} text-center`}>{story.title}</h2>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentScene.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/50"
                >
                    <div className="prose prose-lg mb-6 text-gray-800">
                        {currentScene.text}
                    </div>

                    {currentScene.visual_description && (
                        <div className="text-xs text-gray-500 italic mb-4 border-l-2 p-2 pl-4 border-gray-300">
                            Visual Prompt: {currentScene.visual_description}
                        </div>
                    )}

                    {currentScene.interactive_element && (
                        <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
                            <p className="font-semibold text-gray-700 mb-2">{currentScene.interactive_element.question || "Reflect on this..."}</p>
                            <div className="flex flex-col gap-2">
                                {currentScene.interactive_element.options?.map((opt: string, idx: number) => (
                                    <button key={idx} className={`text-left px-4 py-2 rounded border hover:bg-gray-100 transition-colors ${colors.border}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-6">
                <button
                    onClick={handlePrev}
                    disabled={currentSceneIndex === 0}
                    className="px-4 py-2 text-gray-500 disabled:opacity-30 hover:text-gray-800 transition-colors"
                >
                    &larr; Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={isLastScene}
                    className={`px-6 py-2 rounded-full font-semibold text-white shadow-md transition-transform active:scale-95 ${colors.accent} disabled:opacity-50`}
                >
                    {isLastScene ? 'End of Story' : 'Next Scene &rarr;'}
                </button>
            </div>

            <div className="mt-4 flex justify-center gap-1">
                {story.scenes.map((_: any, idx: number) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSceneIndex ? `w-8 ${colors.accent}` : 'w-2 bg-gray-300'}`}
                    />
                ))}
            </div>
        </div>
    );
}
