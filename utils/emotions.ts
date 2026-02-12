export type EmotionType = 'political_red' | 'economic_blue' | 'environmental_green' | 'lifestyle_yellow' | 'tragic_gray';

export const EMOTION_COLORS: Record<EmotionType, { bg: string; text: string; border: string; accent: string }> = {
    political_red: {
        bg: 'bg-[#f4606b]/5',
        text: 'text-[#f4606b]',
        border: 'border-[#f4606b]/30',
        accent: 'bg-[#f4606b]',
    },
    economic_blue: {
        bg: 'bg-[#3f65ef]/5',
        text: 'text-[#3f65ef]',
        border: 'border-[#3f65ef]/30',
        accent: 'bg-[#3f65ef]',
    },
    environmental_green: {
        bg: 'bg-[#88d84a]/10',
        text: 'text-[#6aa83e]', // Darkened version of #88d84a for better readability
        border: 'border-[#88d84a]/40',
        accent: 'bg-[#88d84a]',
    },
    lifestyle_yellow: {
        bg: 'bg-[#ffd150]/10',
        text: 'text-[#dcb543]', // Darkened version of #ffd150 for better readability
        border: 'border-[#ffd150]/50',
        accent: 'bg-[#ffd150]',
    },
    tragic_gray: {
        bg: 'bg-[#999898]/10',
        text: 'text-[#232221]', // Main Text color from palette
        border: 'border-[#999898]/30',
        accent: 'bg-[#999898]',
    },
};

export const getEmotionColor = (emotion: EmotionType) => {
    return EMOTION_COLORS[emotion] || EMOTION_COLORS.tragic_gray;
};
