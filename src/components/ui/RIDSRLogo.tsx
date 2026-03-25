// components/ui/RIDSRLogo.tsx
import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface RIDSRLogoProps {
  size?: number;
  color?: string;
  showText?: boolean;
  textSize?: number;
  textColor?: string;
  className?: string;
}

export default function RIDSRLogo({
  size = 100,
  color = "#005DAA",
  showText = true,
  textSize = 16,
  textColor = "#111827",
  className,
}: RIDSRLogoProps) {
  return (
    <Link href="/">
      <div className={cn("flex items-center", className)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          width={size}
          height={size}
          fill="none"
        >
          {/* Shield Outline */}
          <path
            d="M100 10 L180 50 L160 160 L40 160 L20 50 Z"
            stroke={color}
            strokeWidth="4"
            fill="none"
          />

          {/* Digital Pulse/Node */}
          <path
            d="M40 100 Q70 80 100 100 T160 100"
            stroke={color}
            strokeWidth="3"
            fill="none"
          />
          <circle cx="160" cy="100" r="6" fill={color} />

          {/* Sun Rays */}
          <g fill="#FFD200">
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = i * 15 * (Math.PI / 180);
              const x = 100 + Math.cos(angle) * 30;
              const y = 100 + Math.sin(angle) * 30;
              return (
                <line
                  key={i}
                  x1="100"
                  y1="100"
                  x2={x}
                  y2={y}
                  stroke="#FFD200"
                  strokeWidth="2"
                />
              );
            })}
          </g>
        </svg>

        {showText && (
          <span
            className="ml-2 font-bold"
            style={{ fontSize: `${textSize}px`, color: textColor }}
          >
            RIDSR
          </span>
        )}
      </div>
    </Link>
  );
}
