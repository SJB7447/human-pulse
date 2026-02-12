'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import { Suspense, useRef } from 'react';

function AnimatedShape() {
    const meshRef = useRef<any>(null);

    useFrame((state) => {
        if (meshRef.current) {
            // Subtle rotation
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere args={[1, 100, 200]} scale={2.2}>
                <MeshDistortMaterial
                    color="#6366f1" // Indigo-500
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.1}
                />
            </Sphere>
        </Float>
    );
}

function Lighting() {
    return (
        <>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#e0e7ff" />
            <pointLight position={[-10, -10, -10]} color="#818cf8" intensity={0.5} />
        </>
    );
}

export default function Hero3D() {
    return (
        <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden opacity-60">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <Suspense fallback={null}>
                    <Lighting />
                    <AnimatedShape />
                </Suspense>
            </Canvas>
        </div>
    );
}
