/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unknown-property */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Environment,
  OrbitControls,
  shaderMaterial,
  Stars,
} from "@react-three/drei";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

import * as THREE from "three";

import { Certificate } from "./certificate";
import SceneLoader from "./scene-loader";

const GoldenShaderMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0xffd700),
  },

  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      
      // Simple shimmer effect based on time
      float shimmer = sin(uv.y * 10.0 + time) * 0.1 + 0.9;
      
      // Gold color with shimmer
      vec3 finalColor = color * shimmer;
      
      // Add a subtle highlight
      float highlight = pow(sin(uv.y * 3.14159), 4.0) * 0.3;
      finalColor += vec3(highlight);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
);

extend({ GoldenShaderMaterial });

const playCoinSound = () => {
  const audio = new Audio("/sounds/coin.mp3");
  audio.volume = 0.3;
  audio.play().catch((e) => console.error("Audio play failed:", e));
};

const playImpactSound = () => {
  const audio = new Audio("/sounds/impact.mp3");
  audio.volume = 0.4;
  audio.play().catch((e) => console.error("Audio play failed:", e));
};

const CustomCoin = ({
  position = [0, 0, 0],
  scale = 1,
  isUserCoin = false,
  velocity: initialVelocity = [0, 0, 0],
  onInactive = () => {},
}: {
  position: [number, number, number];
  scale?: number;
  isUserCoin?: boolean;
  velocity?: [number, number, number];
  onInactive?: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef(null);
  const [fallen, setFallen] = useState(false);
  const fallSpeed = useMemo(() => Math.random() * 0.03 + 0.02, []);
  const rotationSpeed = useMemo(() => Math.random() * 0.02 + 0.01, []);
  const certificateRef = useRef<THREE.Box3>(new THREE.Box3());
  const coinRef = useRef<THREE.Sphere>(new THREE.Sphere());
  const velocity = useRef<THREE.Vector3>(
    isUserCoin
      ? new THREE.Vector3(
          initialVelocity[0],
          initialVelocity[1],
          initialVelocity[2],
        )
      : new THREE.Vector3(0, -fallSpeed, 0),
  );
  const tempVector = useRef<THREE.Vector3>(new THREE.Vector3());
  const lastPosition = useRef<THREE.Vector3>(new THREE.Vector3());
  const inactiveTime = useRef<number>(0);
  const hasImpacted = useRef<boolean>(false);

  useEffect(() => {
    certificateRef.current.set(
      new THREE.Vector3(-2.5, -1.5, -0.025),
      new THREE.Vector3(2.5, 1.5, 0.025),
    );
    certificateRef.current.translate(new THREE.Vector3(0, 0, 0));

    if (meshRef.current) {
      lastPosition.current.copy(meshRef.current.position);
    }

    if (isUserCoin) {
      playCoinSound();
    }
  }, [isUserCoin]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
      meshRef.current.rotation.x += rotationSpeed * 0.5;

      if (shaderRef.current) {
        //@ts-expect-error unknown property
        shaderRef.current.time = state.clock.elapsedTime;
      }

      if (!fallen) {
        meshRef.current.position.x += velocity.current.x;
        meshRef.current.position.y += velocity.current.y;
        meshRef.current.position.z += velocity.current.z;

        coinRef.current.set(meshRef.current.position.clone(), 0.5 * scale);

        if (certificateRef.current.intersectsSphere(coinRef.current)) {
          const certificateCenter = new THREE.Vector3();
          certificateRef.current.getCenter(certificateCenter);

          tempVector.current
            .copy(meshRef.current.position)
            .sub(certificateCenter)
            .normalize();

          tempVector.current.x += (Math.random() - 0.5) * 0.2;
          tempVector.current.z += (Math.random() - 0.5) * 0.2;

          velocity.current.y = Math.abs(velocity.current.y) * 0.7;
          velocity.current.x = tempVector.current.x * 0.1;
          velocity.current.z = tempVector.current.z * 0.1;

          const impactVelocity = Math.sqrt(
            velocity.current.x * velocity.current.x +
              velocity.current.y * velocity.current.y +
              velocity.current.z * velocity.current.z,
          );

          if (impactVelocity > 0.01 && !hasImpacted.current) {
            playImpactSound();
            hasImpacted.current = true;

            setTimeout(() => {
              hasImpacted.current = false;
            }, 500);
          }
        } else {
          velocity.current.y -= 0.001;
        }

        if (meshRef.current.position.y < -10) {
          setFallen(true);
          setTimeout(() => {
            if (meshRef.current) {
              meshRef.current.position.set(
                (Math.random() - 0.5) * 20,
                10,
                (Math.random() - 0.5) * 5,
              );
              velocity.current.set(0, -fallSpeed, 0);
              setFallen(false);
              inactiveTime.current = 0;
              hasImpacted.current = false;
            }
          }, Math.random() * 2000);
        }

        const movement = new THREE.Vector3()
          .subVectors(meshRef.current.position, lastPosition.current)
          .length();

        if (movement < 0.001) {
          inactiveTime.current += delta;
          if (inactiveTime.current > 2) {
            onInactive();
            inactiveTime.current = 0;
          }
        } else {
          inactiveTime.current = 0;
        }

        lastPosition.current.copy(meshRef.current.position);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} castShadow>
      <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />

      {/*@ts-expect-error unknown property */}
      <goldenShaderMaterial ref={shaderRef} />
    </mesh>
  );
};

const Coins = ({ count = 20 }: { count?: number }) => {
  const { viewport } = useThree();
  const [coins, setCoins] = useState<
    Array<{
      position: [number, number, number];
      scale: number;
      id: number;
    }>
  >([]);
  const nextId = useRef(0);

  useEffect(() => {
    const initialCoins = Array.from({ length: count }).map((_, i) => {
      return {
        position: [
          (Math.random() - 0.5) * viewport.width * 2,
          Math.random() * 20 + 10,
          (Math.random() - 0.5) * 5,
        ] as [number, number, number],
        scale: Math.random() * 0.3 + 0.2,
        id: nextId.current++,
      };
    });
    setCoins(initialCoins);
  }, [count, viewport.width]);

  const handleInactiveCoin = useCallback((id: number) => {
    setCoins((prevCoins) => prevCoins.filter((coin) => coin.id !== id));
  }, []);

  return (
    <>
      {coins.map((coin) => (
        <CustomCoin
          key={coin.id}
          position={coin.position}
          scale={coin.scale}
          onInactive={() => handleInactiveCoin(coin.id)}
        />
      ))}
    </>
  );
};

const Scene = () => {
  const { camera, viewport, mouse } = useThree();
  const [userCoins, setUserCoins] = useState<
    {
      position: [number, number, number];
      scale: number;
      id: number;
      velocity: [number, number, number];
    }[]
  >([]);
  const nextId = useRef(0);

  useEffect(() => {
    camera.position.set(0, 0, 8);
  }, [camera]);

  const handleClick = useCallback(() => {
    const cameraPosition = camera.position.clone();
    camera.far = 4;

    const mouseX = (mouse.x * viewport.width) / 2;
    const mouseY = (mouse.y * viewport.height) / 2;

    const targetVector = new THREE.Vector3(mouseX, mouseY, 0);

    const direction = new THREE.Vector3()
      .subVectors(targetVector, cameraPosition)
      .normalize();

    setUserCoins((prevCoins) => [
      ...prevCoins,
      {
        position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
        scale: Math.random() * 0.3 + 0.2,
        id: nextId.current++,
        velocity: [direction.x * 0.2, direction.y * 0.2, direction.z * 0.2],
      },
    ]);
  }, [camera, mouse, viewport]);

  const handleInactiveUserCoin = useCallback((id: number) => {
    setUserCoins((prevCoins) => prevCoins.filter((coin) => coin.id !== id));
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} castShadow />

      <spotLight
        position={[0, 8, 3]}
        angle={0.3}
        penumbra={0.5}
        intensity={2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Environment preset="sunset" />
      <Stars radius={100} depth={50} count={1000} factor={4} />

      <Certificate position={[0, 0, 0]} />

      <Coins count={15} />

      {userCoins.map((coin) => (
        <CustomCoin
          key={coin.id}
          position={coin.position}
          scale={coin.scale}
          isUserCoin={true}
          velocity={coin.velocity}
          onInactive={() => handleInactiveUserCoin(coin.id)}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={8}
        maxDistance={8}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
      />

      <mesh position={[0, 0, 0]} onClick={handleClick}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
        />
        <Vignette offset={0.5} darkness={0.5} eskil={false} />
      </EffectComposer>
    </>
  );
};

export default function MasterDevScene() {
  useEffect(() => {
    const preloadAudio = (url: string) => {
      const audio = new Audio(url);
      audio.volume = 0;
      audio.muted = true;
      audio.play().catch(() => {});
    };

    preloadAudio("/sounds/coin.mp3");
    preloadAudio("/sounds/impact.mp3");
  }, []);

  return (
    <>
      <SceneLoader />
      <Canvas shadows>
        <Scene />
      </Canvas>
    </>
  );
}
