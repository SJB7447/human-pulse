export type EmotionType = 'political_red' | 'economic_blue' | 'environmental_green' | 'lifestyle_yellow' | 'tragic_gray';

export const EMOTION_COLORS: Record<EmotionType, { bg: string; text: string; border: string; accent: string }> = {
    political_red: {
        bg: 'bg-red-50',
        text: 'text-red-900',
        border: 'border-red-200',
        accent: 'bg-red-500',
    },
    economic_blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        border: 'border-blue-200',
        accent: 'bg-blue-500',
    },
    environmental_green: {
        bg: 'bg-green-50',
        text: 'text-green-900',
        border: 'border-green-200',
        accent: 'bg-green-500',
    },
    lifestyle_yellow: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-900',
        border: 'border-yellow-200',
        accent: 'bg-yellow-500',
    },
    tragic_gray: {
        bg: 'bg-gray-50',
        text: 'text-gray-900',
        border: 'border-gray-200',
        accent: 'bg-gray-500',
    },
};

export const getEmotionColor = (emotion: EmotionType) => {
    return EMOTION_COLORS[emotion] || EMOTION_COLORS.tragic_gray;
};
