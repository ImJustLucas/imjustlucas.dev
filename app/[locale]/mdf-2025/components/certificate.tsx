/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

export const Certificate = ({
  position = [0, 0, 0],
  still = false,
}: {
  position?: [number, number, number];
  /** Held where it is: paused, or reduced motion. */
  still?: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  // Its own clock, so the bob resumes where it paused.
  const time = useRef(0);

  const { scene } = useGLTF("/models/cheque.glb");

  const initialYRotation = -Math.PI / 2;

  useFrame((_, delta) => {
    if (still || !groupRef.current) return;
    time.current += Math.min(delta, 1 / 20);
    groupRef.current.position.y =
      position[1] + Math.sin(time.current * 0.5) * 0.1;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, initialYRotation, 0]}
    >
      <primitive object={scene} scale={[1, 1, 1]} />
    </group>
  );
};

useGLTF.preload("/models/cheque.glb");
