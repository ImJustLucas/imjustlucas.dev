/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

export const Certificate = ({
  position = [0, 0, 0],
}: {
  position?: [number, number, number];
}) => {
  const groupRef = useRef<THREE.Group>(null);

  const { scene } = useGLTF("/models/cheque.glb");

  const initialYRotation = -Math.PI / 2;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
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
