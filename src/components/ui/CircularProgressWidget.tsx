"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
interface CircularProgressWidgetProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  circleColor?: string;
  progressColor?: string;
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  animate?: boolean;
}
export default function CircularProgressWidget({
  value,
  maxValue = 100,
  size = 120,
  strokeWidth = 12,
  circleColor = "text-slate-100",
  progressColor = "text-blue-600",
  label,
  valuePrefix = "",
  valueSuffix = "",
  animate = true,
}: CircularProgressWidgetProps) {
  const [currentValue, setCurrentValue] = useState(animate ? 0 : value);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => setCurrentValue(value), 100);
      return () => clearTimeout(timeout);
    } else {
      setCurrentValue(value);
    }
  }, [value, animate]);
  const percentage = Math.min(
    100,
    Math.max(0, (currentValue / maxValue) * 100),
  );
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <div
      className="flex flex-col items-center justify-center relative"
      style={{ width: size, height: size }}
    >
      {" "}
      <svg className="transform -rotate-90 w-full h-full">
        {" "}
        {/* Background Circle */}{" "}
        <circle
          className={circleColor}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />{" "}
        {/* Progress Circle */}{" "}
        <circle
          className={`${progressColor} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />{" "}
      </svg>{" "}
      {/* Centered Value Content */}{" "}
      <div className="absolute inset-0 flex flex-col items-center justify-center font-serif text-slate-900">
        {" "}
        <span className="text-3xl font-black">
          {" "}
          {valuePrefix} {value} {valueSuffix}{" "}
        </span>{" "}
      </div>{" "}
      {label && (
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">
          {label}
        </p>
      )}{" "}
    </div>
  );
}
