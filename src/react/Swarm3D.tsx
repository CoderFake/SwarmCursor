import React, { useEffect, useRef } from "react";
import type { Swarm3DBuildMode } from "../core/types";
import {
  registerSwarm3D,
  type Box3Bounds,
  type Phase3DWeights,
  type Swarm3DHandle,
} from "../three";

export interface UseSwarm3DOptions {
  id: string;
  buildMode?: Swarm3DBuildMode;
  squadSize?: number;
  boundingBox?: Box3Bounds;
  onProgress?: (progress: number, weights: Phase3DWeights) => void;
}

export function useSwarm3D(options: UseSwarm3DOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<Swarm3DHandle | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const handle = registerSwarm3D({
      id: options.id,
      container: containerRef.current,
      buildMode: options.buildMode ?? "all",
      squadSize: options.squadSize ?? 4,
      boundingBox: options.boundingBox,
      onProgress: options.onProgress,
    });
    handleRef.current = handle;
    return () => {
      handle.dispose();
      handleRef.current = null;
    };
  }, [options.id, options.buildMode, options.squadSize]);

  return { containerRef, handleRef };
}

export interface Swarm3DProps {
  id: string;
  src?: string;
  buildMode?: Swarm3DBuildMode;
  squadSize?: number;
  className?: string;
  style?: React.CSSProperties;
  onProgress?: (progress: number, weights: Phase3DWeights) => void;
  children?: React.ReactNode;
}

/**
 * Declarative `<Swarm3D>` component for GLB / Three.js 3D models.
 * Automatically registers with the SwarmCursor 3D Build Engine (`extrude`,
 * `particles`, `slice`, or combined `all` multi-pass choreography).
 */
export function Swarm3D({
  id,
  src,
  buildMode = "all",
  squadSize = 4,
  className,
  style,
  onProgress,
  children,
}: Swarm3DProps) {
  const { containerRef } = useSwarm3D({
    id,
    buildMode,
    squadSize,
    onProgress,
  });

  return (
    <div
      id={id}
      ref={containerRef}
      data-swarm="3d"
      data-swarm-3d={buildMode}
      data-swarm-id={id}
      data-swarm-squad={squadSize}
      data-swarm-src={src}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
