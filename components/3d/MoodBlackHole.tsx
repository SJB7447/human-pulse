'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';

function Vortex({ isVenting }: { isVenting: boolean }) {
    const meshRef = useRef<any>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Speed up rotation when venting
            const speed = isVenting ? 5 : 0.5;
            meshRef.current.rotation.z += delta * speed;

            // Pulse scale when venting
            if (isVenting) {
                const scale = 1 + Math.sin(state.clock.getElapsedTime() * 10) * 0.1;
                meshRef.current.scale.set(scale, scale, scale);
            } else {
                meshRef.current.scale.lerp({ x: 1, y: 1, z: 1 }, 0.1);
            }
        }
    });

    return (
        <group>
            {/* The Black Hole Core */}
            <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
                <MeshDistortMaterial
                    color={isVenting ? "#ff0000" : "#000000"}
                    attach="material"
                    distort={0.6}
                    speed={isVenting ? 4 : 2}
                    roughness={0.1}
                    metalness={0.9}
                    emissive={isVenting ? "#ff3333" : "#000000"}
                    emissiveIntensity={isVenting ? 2 : 0}
                />
            </Sphere>

            {/* Particle Field - sucks in when venting */}
            <Sparkles
                count={isVenting ? 500 : 100}
                scale={isVenting ? 8 : 10}
                size={isVenting ? 10 : 2}
                speed={isVenting ? 5 : 0.4}
                opacity={0.8}
                color={isVenting ? "#ffaa00" : "#88ccff"}
            />
        </group>
    );
}

export default function MoodBlackHole({ isVenting }: { isVenting: boolean }) {
    return (
        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-black/90">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Vortex isVenting={isVenting} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                </Suspense>
            </Canvas>
        </div>
    );
}
