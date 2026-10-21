/* eslint-disable react/no-unknown-property */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Environment,
  OrbitControls,
  shaderMaterial,
  Stars,
} from "@react-three/drei";
import {
  Canvas,
  extend,
  type ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import {
  Coins as CoinsIcon,
  MousePointerClick,
  Pause,
  Play,
} from "lucide-react";
import * as THREE from "three";

import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { useSounds } from "@/components/sound/SoundProvider";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { SAMPLES } from "@/lib/sound/kit";

import { Certificate } from "./certificate";
import SceneLoader from "./scene-loader";

const GoldenShaderMaterial = shaderMaterial(
  {
    time: 0,
    // Legendary gold: the coins belong to the legendary item.
    color: new THREE.Color(0xffd84d),
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

const CERTIFICATE_BOX = new THREE.Box3(
  new THREE.Vector3(-2.5, -1.5, -0.025),
  new THREE.Vector3(2.5, 1.5, 0.025),
);
const CERTIFICATE_CENTER = CERTIFICATE_BOX.getCenter(new THREE.Vector3());
/** The physics constants are tuned per 60 fps frame. */
const FRAMES_PER_SECOND = 60;
/** The longest step taken at once, so a frame after a tab switch can't teleport coins. */
const MAX_DELTA = 1 / 20;

/** The lens's vertical field of view in a wide well. */
const LENS_FOV = 45;
/** Half the width to keep in view at the cheque, with a margin. */
const CHEQUE_HALF_WIDTH = 3.6;

/**
 * Keeps the whole cheque in view: a wide well uses the long lens, a narrow
 * (phone) one widens the field of view until the cheque fits across it.
 */
const Lens = () => {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera as THREE.PerspectiveCamera).isPerspectiveCamera) return;
    if (!size.width || !size.height) return;
    const aspect = size.width / size.height;
    const distance = camera.position.length() || 8;
    const fitting =
      2 *
      THREE.MathUtils.radToDeg(
        Math.atan(CHEQUE_HALF_WIDTH / distance / aspect),
      );
    // Fitting the R3F camera to the canvas is the intended pattern.
    // eslint-disable-next-line react-hooks/immutability
    (camera as THREE.PerspectiveCamera).fov = Math.max(LENS_FOV, fitting);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
};

const CustomCoin = ({
  position = [0, 0, 0],
  scale = 1,
  isUserCoin = false,
  velocity: initialVelocity = [0, 0, 0],
  onInactive = () => {},
  onImpact,
  still = false,
}: {
  position: [number, number, number];
  scale?: number;
  isUserCoin?: boolean;
  velocity?: [number, number, number];
  onInactive?: () => void;
  /** Called when the coin lands on the certificate (the visitor's coins only). */
  onImpact?: () => void;
  /** Frozen where it is: paused, or reduced motion. */
  still?: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef(null);
  const [fallen, setFallen] = useState(false);
  // Random speeds are computed once per coin on purpose.
  // eslint-disable-next-line react-hooks/purity
  const fallSpeed = useMemo(() => Math.random() * 0.03 + 0.02, []);
  // eslint-disable-next-line react-hooks/purity
  const rotationSpeed = useMemo(() => Math.random() * 0.02 + 0.01, []);
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
  // Its own clock, so the shimmer resumes where it paused.
  const shimmerTime = useRef<number>(0);

  useEffect(() => {
    if (meshRef.current) {
      lastPosition.current.copy(meshRef.current.position);
    }
  }, []);

  useFrame((_, delta) => {
    if (still) return;
    if (meshRef.current) {
      const step = Math.min(delta, MAX_DELTA) * FRAMES_PER_SECOND;

      meshRef.current.rotation.y += rotationSpeed * step;
      meshRef.current.rotation.x += rotationSpeed * 0.5 * step;

      shimmerTime.current += step / FRAMES_PER_SECOND;
      if (shaderRef.current) {
        //@ts-expect-error unknown property
        shaderRef.current.time = shimmerTime.current;
      }

      if (!fallen) {
        meshRef.current.position.addScaledVector(velocity.current, step);

        coinRef.current.center.copy(meshRef.current.position);
        coinRef.current.radius = 0.5 * scale;

        if (CERTIFICATE_BOX.intersectsSphere(coinRef.current)) {
          tempVector.current
            .copy(meshRef.current.position)
            .sub(CERTIFICATE_CENTER)
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

          if (onImpact && impactVelocity > 0.01 && !hasImpacted.current) {
            onImpact();
            hasImpacted.current = true;

            setTimeout(() => {
              hasImpacted.current = false;
            }, 500);
          }
        } else {
          velocity.current.y -= 0.001 * step;
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

        const movement = meshRef.current.position.distanceTo(
          lastPosition.current,
        );

        if (movement < 0.001 * step) {
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
    <mesh ref={meshRef} position={position} scale={scale}>
      <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />

      {/*@ts-expect-error unknown property */}
      <goldenShaderMaterial ref={shaderRef} />
    </mesh>
  );
};

const Coins = ({
  count = 20,
  still = false,
}: {
  count?: number;
  still?: boolean;
}) => {
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
    const initialCoins = Array.from({ length: count }, () => {
      return {
        position: [
          (Math.random() - 0.5) * viewport.width * 1.2,
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
          still={still}
        />
      ))}
    </>
  );
};

const Scene = ({
  still,
  day,
  throws,
}: {
  still: boolean;
  /** Light mode: the palette's daylight, no stars, no vignette. */
  day: boolean;
  /** Counts the presses of the throw button; each one throws a coin. */
  throws: number;
}) => {
  const { camera, viewport, pointer } = useThree();
  const { play } = useSounds();
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

  /** Throws a coin from the camera towards a point of the certificate's plane. */
  const throwCoin = useCallback(
    (targetX: number, targetY: number) => {
      const cameraPosition = camera.position.clone();
      const targetVector = new THREE.Vector3(targetX, targetY, 0);

      const direction = new THREE.Vector3()
        .subVectors(targetVector, cameraPosition)
        .normalize();
      // Just in front of the camera, never inside its near plane.
      const spawn = cameraPosition.addScaledVector(direction, 1.5);

      setUserCoins((prevCoins) => [
        ...prevCoins,
        {
          position: [spawn.x, spawn.y, spawn.z],
          scale: Math.random() * 0.3 + 0.2,
          id: nextId.current++,
          velocity: [direction.x * 0.2, direction.y * 0.2, direction.z * 0.2],
        },
      ]);
      play("throw");
    },
    [camera, play],
  );

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (still) return;
      // A drag to orbit the camera, not a throw.
      if (event.delta > 4) return;
      throwCoin(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
      );
    },
    [pointer, viewport, still, throwCoin],
  );

  // The throw button (keyboards, screen readers): somewhere on the cheque.
  useEffect(() => {
    if (throws === 0) return;
    throwCoin((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2);
  }, [throws, throwCoin]);

  // Only a coin the visitor threw makes a sound when it lands.
  const handleImpact = useCallback(
    () => play("clink", { random: Math.random() }),
    [play],
  );

  const handleInactiveUserCoin = useCallback((id: number) => {
    setUserCoins((prevCoins) => prevCoins.filter((coin) => coin.id !== id));
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />

      <spotLight
        position={[0, 8, 3]}
        angle={0.3}
        penumbra={0.5}
        intensity={2}
        color="#ffffff"
      />

      <Environment preset="sunset" />
      {!day && (
        <Stars
          radius={100}
          depth={50}
          count={1000}
          factor={4}
          speed={still ? 0 : 1}
        />
      )}

      <Certificate position={[0, 0, 0]} still={still} />

      <Coins count={15} still={still} />

      {userCoins.map((coin) => (
        <CustomCoin
          key={coin.id}
          position={coin.position}
          scale={coin.scale}
          isUserCoin={true}
          velocity={coin.velocity}
          onInactive={() => handleInactiveUserCoin(coin.id)}
          onImpact={handleImpact}
          still={still}
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
        {/* Invisible to the eye and to depth, so the stars behind it still draw */}
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {day ? (
        // By day only the gold glows: a light ground must not bloom.
        <EffectComposer>
          <Bloom
            intensity={0.35}
            luminanceThreshold={0.85}
            luminanceSmoothing={0.2}
          />
        </EffectComposer>
      ) : (
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
          <Vignette offset={0.5} darkness={0.5} eskil={false} />
        </EffectComposer>
      )}
    </>
  );
};

/**
 * The showcase: the scene in a sunken well (night sky in the dark modes, the
 * palette's daylight in light), and under it the controls: throw a coin,
 * the hint, and pause. Still under reduced motion until the visitor plays.
 */
export default function MasterDevScene() {
  const t = useTranslations("Mdf2025");
  const { play } = useSounds();
  const { resolvedTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  // null until the visitor chooses: still under reduced motion, moving otherwise.
  const [paused, setPaused] = useState<boolean | null>(null);
  const [throws, setThrows] = useState(0);
  const still = paused ?? reducedMotion;
  const day = resolvedTheme === "light";

  useEffect(() => {
    // Warm the HTTP cache, so the first throw sounds at once.
    for (const url of Object.values(SAMPLES)) {
      fetch(url).catch(() => {});
    }
  }, []);

  const togglePause = () => {
    play(still ? "toggleOn" : "toggleOff");
    setPaused(!still);
  };

  return (
    <div className="tray flex flex-col gap-3 rounded-lg bg-raised p-3 sm:gap-4 sm:p-4">
      <div className="relative h-[clamp(320px,52dvh,420px)] overflow-hidden rounded-md bg-ground sm:h-[clamp(380px,58dvh,600px)]">
        <SceneLoader />
        <Canvas
          // A longer lens than the default, so the cheque fills the well
          camera={{ fov: LENS_FOV, position: [0, 0, 8] }}
          frameloop={still ? "demand" : "always"}
        >
          <Lens />
          <Scene still={still} day={day} throws={throws} />
        </Canvas>
        {/* The well's lip, drawn over the canvas */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_2px_0_rgb(var(--ledge))]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:px-1">
        <Button disabled={still} onClick={() => setThrows((n) => n + 1)}>
          <CoinsIcon aria-hidden />
          {t("throw")}
        </Button>
        <TypographyMuted className="order-last flex basis-full items-center gap-2 sm:order-none sm:basis-auto">
          <MousePointerClick aria-hidden className="size-4 shrink-0" />
          {still ? (
            t("hintStill")
          ) : (
            <>
              <span className="[@media(pointer:coarse)]:hidden">
                {t("hint")}
              </span>
              <span className="hidden [@media(pointer:coarse)]:inline">
                {t("hintTouch")}
              </span>
            </>
          )}
        </TypographyMuted>
        <Button className="ml-auto" onClick={togglePause}>
          {still ? <Play aria-hidden /> : <Pause aria-hidden />}
          {still ? t("play") : t("pause")}
        </Button>
      </div>
    </div>
  );
}
