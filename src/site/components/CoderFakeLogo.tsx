import React from "react";

export function CoderFakeLogo({
  size = 34,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="CoderFake Logo"
    >
      <defs>
        <linearGradient id="cf-bg-grad-inline" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#F5F3FF" />
          <stop offset="52%" stop-color="#EDE9FE" />
          <stop offset="100%" stop-color="#E0E7FF" />
        </linearGradient>
        <radialGradient id="cf-ambient-glow-inline" cx="60" cy="60" r="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#8B5CF6" stopOpacity="0.22" />
          <stop offset="55%" stop-color="#6D5DF6" stopOpacity="0.10" />
          <stop offset="100%" stop-color="#38BDF8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cf-c-fill-inline" x1="16" y1="20" x2="92" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#9333EA" />
          <stop offset="38%" stop-color="#7C3AED" />
          <stop offset="72%" stop-color="#6D5DF6" />
          <stop offset="100%" stop-color="#0284C7" />
        </linearGradient>
        <linearGradient id="cf-f-fill-inline" x1="40" y1="42" x2="100" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#8B5CF6" />
          <stop offset="48%" stop-color="#6D5DF6" />
          <stop offset="100%" stop-color="#0EA5E9" />
        </linearGradient>
        <linearGradient id="cf-rim-grad-inline" x1="16" y1="18" x2="100" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#C084FC" />
          <stop offset="45%" stop-color="#8B5CF6" />
          <stop offset="100%" stop-color="#38BDF8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="116" height="116" rx="28" fill="url(#cf-bg-grad-inline)" />
      <rect x="2" y="2" width="116" height="116" rx="28" fill="url(#cf-ambient-glow-inline)" />
      <g stroke="#6D5DF6" strokeOpacity="0.09" strokeWidth="1">
        <path d="M22 2 V118 M98 2 V118 M2 26 H118 M2 94 H118" />
        <path d="M14 42 H32 L42 32 V14 M106 78 H88 L78 88 V106" />
      </g>
      <rect x="3" y="3" width="114" height="114" rx="27" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="1.5" />
      <rect x="2" y="2" width="116" height="116" rx="28" stroke="#8B5CF6" strokeOpacity="0.32" strokeWidth="1.2" />
      <g>
        <path
          d="M 86.1 28.8 A 42 42 0 1 0 35.5 95.5 L 41.2 84.8 A 30 30 0 1 1 78.1 37.7 Z"
          fill="url(#cf-c-fill-inline)"
          stroke="url(#cf-rim-grad-inline)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M 80.5 34.2 A 36 36 0 1 0 38.6 89.2"
          stroke="#F5F3FF"
          strokeOpacity="0.82"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M 48.5 100.9 A 42 42 0 0 0 92.0 84.7 L 82.3 77.6 A 30 30 0 0 1 53.5 89.7 Z"
          fill="url(#cf-c-fill-inline)"
          stroke="url(#cf-rim-grad-inline)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M 51.4 94.8 A 36 36 0 0 0 86.5 80.8"
          stroke="#E0F2FE"
          strokeOpacity="0.85"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M 40.0 105.0 L 61.0 43.0 H 99.0 L 93.2 55.0 H 68.8 L 63.6 68.0 H 86.0 L 80.2 79.5 H 59.0 L 49.0 98.5 Z"
          fill="url(#cf-f-fill-inline)"
          stroke="url(#cf-rim-grad-inline)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M 45.2 95.5 L 64.6 49.0 H 92.5 M 61.2 73.8 H 79.8"
          stroke="#FFFFFF"
          strokeOpacity="0.88"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
