"use client";

import React from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export default function Sparkline({
  data,
  color = "#00F0FF",
  height = 30,
  width = 100,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((val, i) => {
      const x = i * stepX;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_2px_rgba(0,0,0,0.1)]"
      />
    </svg>
  );
}
