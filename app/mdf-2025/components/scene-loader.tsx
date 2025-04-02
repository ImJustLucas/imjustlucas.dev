"use client";

import { useProgress } from "@react-three/drei";

export default function SceneLoader() {
  const { progress, active } = useProgress();

  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="text-center">
        <div
          className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-t-transparent text-primary"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <div className="mt-4 text-white text-lg font-semibold">
          Loading Scene: {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}
