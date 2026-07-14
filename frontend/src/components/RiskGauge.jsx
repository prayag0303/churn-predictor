import { useState, useEffect } from 'react';

const ARC = Math.PI * 80; // half-circumference of r=80 circle ≈ 251.3

export default function RiskGauge({ probability = 0 }) {
  const [animated, setAnimated] = useState(0);

  // Animate from 0 on mount / when probability changes
  useEffect(() => {
    const t = setTimeout(() => setAnimated(probability), 60);
    return () => clearTimeout(t);
  }, [probability]);

  const clamped = Math.max(0, Math.min(1, animated));
  const color =
    clamped > 0.65 ? '#EF4444' : clamped >= 0.35 ? '#F59E0B' : '#10B981';
  const offset = ARC * (1 - clamped);

  return (
    <div className="flex flex-col items-center py-2">
      {/* viewBox leaves room below the arc for the label */}
      <svg viewBox="0 0 200 120" className="w-52 h-auto">
        {/* Background track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Coloured fill — animates via stroke-dashoffset */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={ARC}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.85s ease-in-out, stroke 0.3s ease',
          }}
        />
        {/* Percentage number — shows final value immediately, only arc animates */}
        <text
          x="100"
          y="92"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill={color}
          fontFamily="Inter, sans-serif"
        >
          {Math.round(probability * 100)}%
        </text>
        <text
          x="100"
          y="112"
          textAnchor="middle"
          fontSize="12"
          fontWeight="500"
          fill={
            probability > 0.65 ? '#EF4444' : probability >= 0.35 ? '#F59E0B' : '#10B981'
          }
          fontFamily="Inter, sans-serif"
        >
          {probability > 0.65
            ? 'Immediate action recommended'
            : probability >= 0.35
            ? 'Monitor this customer'
            : 'No action needed'}
        </text>
      </svg>
    </div>
  );
}
