'use client';

import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('@/components/3d/Hero3D'), { ssr: false });

export default function HeroBackground() {
    return <Hero3D />;
}
