"use client";

import { useProgress } from "@react-three/drei";

import { SceneLoading } from "./scene-loading";

/** The showcase loading, until every asset of the scene has loaded. */
export default function SceneLoader() {
  const { progress, active } = useProgress();

  // Shown from the first paint (progress 0) until every asset has loaded.
  if (!active && progress === 100) return null;

  return <SceneLoading progress={progress} />;
}
