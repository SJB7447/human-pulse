'use client';

import { motion } from 'framer-motion';
import { EMOTION_COLORS, EmotionType } from '@/utils/emotions';

interface EmotionData {
    emotion: string; // string key matching EmotionType
    count: number;
}

interface EmotionChartProps {
    data: EmotionData[];
    total: number;
}

export default function EmotionChart({ data, total }: EmotionChartProps) {
    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="w-32 h-32 rounded-full border-4 border-gray-100 mb-4 bg-gray-50 flex items-center justify-center">
                    <span className="text-2xl">?</span>
                </div>
                <p>아직 감정 데이터가 없습니다.</p>
            </div>
        );
    }

    // Calculate segments for donut chart
    let currentAngle = 0;
    const radius = 80;
    const strokeWidth = 20;
    const center = 100;
    const circumference = 2 * Math.PI * radius;

    const segments = data.map((item) => {
        const percentage = item.count / total;
        const dashArray = `${percentage * circumference} ${circumference}`;
        const rotate = currentAngle;
        currentAngle += percentage * 360;

        const colorKey = item.emotion as EmotionType;
        // Map implementation colors to hex or specific tailwind colors if possible?
        // Since we are inside SVG, we need explicit colors.
        // Let's use a mapping based on the emotion names.
        let color = '#9CA3AF'; // default gray
        if (colorKey === 'political_red') color = '#EF4444'; // red-500
        if (colorKey === 'economic_blue') color = '#3B82F6'; // blue-500
        if (colorKey === 'environmental_green') color = '#10B981'; // green-500
        if (colorKey === 'lifestyle_yellow') color = '#F59E0B'; // amber-500
        if (colorKey === 'tragic_gray') color = '#6B7280'; // gray-500

        return {
            ...item,
            dashArray,
            rotate,
            color,
            percentage
        };
    });

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-64 h-64">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="#F3F4F6"
                        strokeWidth={strokeWidth}
                    />

                    {/* Data Segments */}
                    {segments.map((segment, index) => (
                        <motion.circle
                            key={segment.emotion}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={segment.dashArray}
                            strokeDashoffset={0} // We rotate the element instead of using offset for segments
                            initial={{ strokeDasharray: `0 ${circumference}` }}
                            animate={{ strokeDasharray: segment.dashArray }}
                            transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                            style={{
                                transformOrigin: 'center',
                                transform: `rotate(${segment.rotate}deg)`
                            }}
                        />
                    ))}

                    {/* Center Text */}
                    <foreignObject x="40" y="40" width="120" height="120" style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <span className="text-3xl font-bold text-gray-800">{total}</span>
                            <span className="text-xs text-gray-500">총 상호작용</span>
                        </div>
                    </foreignObject>
                </svg>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2">
                {segments.map((segment) => (
                    <div key={segment.emotion} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                        <span className="capitalize text-gray-600">{segment.emotion.replace('_', ' ')}</span>
                        <span className="font-semibold text-gray-900 ml-auto">
                            {Math.round(segment.percentage * 100)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
