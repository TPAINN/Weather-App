import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedSphere = ({ color, speed, noise }) => {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      const targetColor = new THREE.Color(color);
      materialRef.current.color.lerp(targetColor, 0.05);
      materialRef.current.distort = 0.4 + Math.sin(state.clock.elapsedTime * (speed / 10)) * 0.2;
      materialRef.current.speed = speed / 2;
    }
    
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 128, 128]} scale={2.5}>
      <MeshDistortMaterial 
        ref={materialRef}
        color={color}
        speed={speed}
        distort={noise}
        roughness={0.2}
        metalness={0.8}
        envMapIntensity={1}
      />
    </Sphere>
  );
};

const AmbientParticles = () => {
  const particlesRef = useRef();
  const count = 100;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ffffff"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
};

const Silk = ({ color, speed, noiseIntensity }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        background: 'transparent',
        pointerEvents: 'none'
      }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <AnimatedSphere color={color} speed={speed} noise={noiseIntensity} />
      <AmbientParticles />
    </Canvas>
  );
};

export default Silk;
