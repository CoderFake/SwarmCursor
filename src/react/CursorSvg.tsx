import React from "react";
import { ARROW_CURSOR_PATH, CURSOR_HOTSPOTS } from "../core/constants";
import type { CursorShape, SwarmCursor } from "../core/types";

export function CursorIcon({
  shape,
  color,
}: {
  shape: CursorShape;
  color: string;
}) {
  const baseStroke = {
    stroke: "#fff",
    strokeWidth: 1.5,
    strokeLinejoin: "round" as const,
  };

  switch (shape) {
    case "arrow":
      return <path d={ARROW_CURSOR_PATH} fill={color} {...baseStroke} />;

    case "dup":
      return (
        <>
          <path
            d={ARROW_CURSOR_PATH}
            transform="translate(4 3.5)"
            fill="#fff"
            stroke={color}
            strokeWidth={1.3}
            strokeLinejoin="round"
          />
          <path d={ARROW_CURSOR_PATH} fill={color} {...baseStroke} />
        </>
      );

    case "pen":
    case "pen-add":
    case "pen-close":
      return (
        <>
          <path
            d="M17.4 10.6 L20.6 13.8 L13.8 20.6 L10.6 17.4 Z"
            fill={color}
            {...baseStroke}
          />
          <path
            d="M3 3 L13.1 6.3 L17.4 10.6 L10.6 17.4 L6.3 13.1 Z"
            fill={color}
            {...baseStroke}
          />
          <path
            d="M3.6 3.6 L8.9 8.9"
            stroke="#fff"
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <circle
            cx={10.2}
            cy={10.2}
            r={1.75}
            fill="none"
            stroke="#fff"
            strokeWidth={1.2}
          />
          {shape === "pen-add" && (
            <g strokeLinecap="round">
              <path
                d="M23 19.5 V26.5 M19.5 23 H26.5"
                stroke="#fff"
                strokeWidth={3.4}
              />
              <path
                d="M23 19.5 V26.5 M19.5 23 H26.5"
                stroke="#1E1E1E"
                strokeWidth={1.3}
              />
            </g>
          )}
          {shape === "pen-close" && (
            <>
              <circle
                cx={23}
                cy={23}
                r={2.8}
                fill="none"
                stroke="#fff"
                strokeWidth={3.2}
              />
              <circle
                cx={23}
                cy={23}
                r={2.8}
                fill="none"
                stroke="#1E1E1E"
                strokeWidth={1.2}
              />
            </>
          )}
        </>
      );

    case "cross":
      return (
        <g strokeLinecap="round">
          <path
            d="M12 3.5 V20.5 M3.5 12 H20.5"
            stroke="#fff"
            strokeWidth={3.6}
          />
          <path
            d="M12 3.5 V20.5 M3.5 12 H20.5"
            stroke={color}
            strokeWidth={1.5}
          />
        </g>
      );

    case "ibeam": {
      const d =
        "M8.5 4.5 H10.5 Q12 4.5 12 6 Q12 4.5 13.5 4.5 H15.5 M12 6 V18 M8.5 19.5 H10.5 Q12 19.5 12 18 Q12 19.5 13.5 19.5 H15.5";
      return (
        <g fill="none" strokeLinecap="round">
          <path d={d} stroke="#fff" strokeWidth={3.6} />
          <path d={d} stroke={color} strokeWidth={1.5} />
        </g>
      );
    }

    case "ew":
    case "ns":
      return (
        <path
          d="M2.5 12 L7 7.5 V10.4 H17 V7.5 L21.5 12 L17 16.5 V13.6 H7 V16.5 Z"
          transform={shape === "ns" ? "rotate(90 12 12)" : undefined}
          fill={color}
          {...baseStroke}
        />
      );
  }
}

export function CursorView({
  c,
  X,
  Y,
  showLabel = false,
}: {
  c: SwarmCursor;
  X: number;
  Y: number;
  showLabel?: boolean;
}) {
  const [hx, hy] = CURSOR_HOTSPOTS[c.shape];
  const scale = 1 - c.press * 0.12;
  return (
    <div
      className="cursor"
      style={{ transform: `translate(${X}px, ${Y}px)` }}
    >
      <svg
        width={28}
        height={28}
        viewBox="0 0 28 28"
        style={{
          transform: `translate(${-hx}px, ${-hy}px) rotate(${c.angle}deg) scale(${scale})`,
          transformOrigin: `${hx}px ${hy}px`,
        }}
      >
        <CursorIcon shape={c.shape} color={c.color} />
      </svg>
      {showLabel && (
        <div
          className="cursor-label"
          style={{
            left: 16,
            top: 14,
            background: c.color,
            color: "#fff",
          }}
        >
          {c.name}
        </div>
      )}
    </div>
  );
}
