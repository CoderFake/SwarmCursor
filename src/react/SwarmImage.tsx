import React from "react";
import type { SwarmImageBuildMode } from "../core/types";

export interface SwarmImageProps {
  /** Unique element ID for the Swarm dependency graph */
  id: string;
  /** Image source URL */
  src: string;
  /** Accessible alt text */
  alt?: string;
  /**
   * Image construction algorithm:
   * - `"mosaic"` — Progressive Quadtree / Macro-Block Pixelation Refinement (coarse 32px blocks -> crisp 0px)
   * - `"scanline"` — Top-to-Bottom Holographic Laser Raster Scan with chromatic edge glow
   * - `"halftone"` — Progressive Halftone Dot-Matrix Screen-Printing materialization
   * - `"all"` — Multi-stage synthesis combining Mosaic block layout + Laser Scanline + Halftone crisp resolve
   */
  buildMode?: SwarmImageBuildMode;
  /** Optional dependency IDs that must finish before this image starts building */
  deps?: string[];
  className?: string;
  style?: React.CSSProperties;
  imgClassName?: string;
  imgStyle?: React.CSSProperties;
}

/**
 * Declarative wrapper for 2D images that swarm cursors progressively construct
 * using Mosaic Quadtree refinement, Laser Scanline rasterization, or Halftone Dot-Matrix printing.
 */
export const SwarmImage: React.FC<SwarmImageProps> = ({
  id,
  src,
  alt = "",
  buildMode = "all",
  deps,
  className,
  style,
  imgClassName,
  imgStyle,
}) => {
  return (
    <div
      id={id}
      data-swarm="image"
      data-swarm-id={id}
      data-swarm-image={buildMode}
      data-swarm-src={src}
      data-swarm-deps={deps?.join(",")}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: "var(--swarm-img-opacity, 1)" as unknown as number,
          filter:
            "blur(var(--swarm-img-blur, 0px)) contrast(var(--swarm-img-contrast, 1))",
          clipPath: "var(--swarm-img-clip, inset(0% 0% 0% 0%))",
          transform: "scale(var(--swarm-img-scale, 1))",
          transition: "opacity 0.18s ease-out, filter 0.14s ease-out",
          ...imgStyle,
        }}
      />
    </div>
  );
};
