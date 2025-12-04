"use client";

import { cn } from "@/lib/utils";

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: "primary" | "accent" | "secondary";
  paused?: boolean; // Пауза анимации через CSS animation-play-state
}

export function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
  position = "center",
  color = "primary",
  paused = false,
}: RippleProps) {
  const positionClasses = {
    center: "left-1/2 top-1/2",
    "top-left": "left-1/4 top-1/4",
    "top-right": "right-1/4 top-1/4",
    "bottom-left": "left-1/3 bottom-1/4",
    "bottom-right": "right-1/3 bottom-1/4",
  };

  const colorVar = {
    primary: "--primary",
    accent: "--accent",
    secondary: "--secondary",
  }[color];

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0",
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.05;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        const borderOpacity = 25 + i * 10;

        return (
          <div
            key={`circle-${i}`}
            className={cn(
              "absolute animate-ripple rounded-full border",
              positionClasses[position]
            )}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: Math.max(0.15, opacity),
              borderWidth: "2px",
              borderColor: `hsl(var(${colorVar}) / ${borderOpacity}%)`,
              borderStyle,
              transform: "translate3d(-50%, -50%, 0)",
              boxShadow: `0 0 ${30 + i * 8}px hsl(var(${colorVar}) / ${borderOpacity * 0.5}%), 0 0 ${60 + i * 12}px hsl(var(${colorVar}) / ${borderOpacity * 0.2}%)`,
              willChange: paused ? "auto" : "transform, opacity",
              backfaceVisibility: "hidden",
              perspective: "1000px",
              animationPlayState: paused ? "paused" : "running" as React.CSSProperties['animationPlayState'],
              // @ts-ignore
              "--i": i,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

