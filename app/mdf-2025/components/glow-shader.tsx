"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import React from "react";

const GlowMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.8, 0.7, 0.3),
    glowColor: new THREE.Color(1.0, 0.8, 0.0),
    glowIntensity: 0.8,
    pulseSpeed: 0.5,
  },
  `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  uniform float time;
  uniform vec3 color;
  uniform vec3 glowColor;
  uniform float glowIntensity;
  uniform float pulseSpeed;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    float rimPower = 4.0;
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float rimAmount = 1.0 - max(0.0, dot(viewDirection, vNormal));
    float rim = pow(rimAmount, rimPower);
    
    float pulse = sin(time * pulseSpeed) * 0.5 + 0.5;
    vec3 finalGlow = glowColor * rim * glowIntensity * (0.8 + pulse * 0.4);
    
     vec3 finalColor = color + finalGlow;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
  `,
);

extend({ GlowMaterial });

interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  glowColor?: string;
  glowIntensity?: number;
  pulseSpeed?: number;
}

const GlowEffect: React.FC<GlowEffectProps> = ({
  children,
  color = "#ccaf00",
  glowColor = "#ffcc00",
  glowIntensity = 0.8,
  pulseSpeed = 0.5,
}) => {
  const materialRef = useRef<any>("");

  const colorObj = useMemo(() => new THREE.Color(color), [color]);
  const glowColorObj = useMemo(() => new THREE.Color(glowColor), [glowColor]);

  // Update time uniform on each frame
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.time = clock.getElapsedTime();
    }
  });

  return (
    <group>
      {React.Children.map(children, (child: any) => {
        return React.cloneElement(child, {
          material: (
            <glowMaterial
              ref={materialRef}
              color={colorObj}
              glowColor={glowColorObj}
              glowIntensity={glowIntensity}
              pulseSpeed={pulseSpeed}
            />
          ),
        });
      })}
    </group>
  );
};

export default GlowEffect;
