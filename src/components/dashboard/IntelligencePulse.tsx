"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float, Text } from "@react-three/drei";
import * as THREE from "three";

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function SignalField({ signals = [] }: { signals: any[] }) {
  const pointsRef = useRef<THREE.Points>(null!);

  // Create particles based on signal momentum
  const particles = useMemo(() => {
    const count = Math.max(signals.length * 10, 500);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = pseudoRandom(i + signals.length) * Math.PI * 2;
      const phi = Math.acos(2 * pseudoRandom((i + 1) * 7) - 1);
      const r = 2 + pseudoRandom((i + 1) * 13) * 2;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Default GIC Blue colors
      colors[i * 3] = 0.23;
      colors[i * 3 + 1] = 0.51;
      colors[i * 3 + 2] = 0.96;
    }
    return { positions, colors };
  }, [signals]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.1;
    pointsRef.current.rotation.z = time * 0.05;

    // Pulse effect
    const scale = 1 + Math.sin(time * 2) * 0.05;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Points
      ref={pointsRef}
      positions={particles.positions}
      colors={particles.colors}
      stride={3}
    >
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function FloatingSignals({ signals = [] }: { signals: any[] }) {
  return (
    <>
      {signals.slice(0, 5).map((signal, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 3.5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = (pseudoRandom(i + 101) - 0.5) * 2;

        return (
          <Float
            key={signal.id || i}
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={1}
            position={[x, y, z]}
          >
            <mesh>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial
                color={signal.sentiment === "negative" ? "#ef4444" : "#3b82f6"}
                emissive={
                  signal.sentiment === "negative" ? "#ef4444" : "#3b82f6"
                }
                emissiveIntensity={2}
              />
            </mesh>
            <Text
              position={[0, 0.4, 0]}
              fontSize={0.15}
              color="white"
              font="/fonts/Inter-Bold.ttf"
              anchorX="center"
              anchorY="middle"
            >
              {signal.source || "SIGNAL"}
            </Text>
          </Float>
        );
      })}
    </>
  );
}

export default function IntelligencePulse({
  signals = [],
}: {
  signals: any[];
}) {
  return (
    <div className="w-full h-[400px] bg-slate-950 rounded-[2.5rem] overflow-hidden border border-white/5 relative group">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <SignalField signals={signals} />
        <FloatingSignals signals={signals} />
      </Canvas>

      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-6 p-4 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 pointer-events-none">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-gic-blue animate-pulse" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">
            Neural Signal Feed
          </span>
        </div>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
          Real-time momentum & narrative velocity
        </p>
      </div>

      {/* Tactical Corners */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
            Fidelity: HIGH
          </span>
        </div>
      </div>
    </div>
  );
}
