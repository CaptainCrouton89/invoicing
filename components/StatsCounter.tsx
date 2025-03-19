"use client";

import { useEffect, useRef, useState } from "react";

interface StatsCounterProps {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}

const StatCounter = ({
  value,
  suffix = "",
  label,
  duration = 2000,
}: StatsCounterProps) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = timestamp - startTimeRef.current;
      const progressRatio = Math.min(progress / duration, 1);

      // Use easeOutQuad easing function for smoother animation
      const easedProgress = 1 - Math.pow(1 - progressRatio, 2);

      const currentCount = Math.round(easedProgress * value);

      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }

      if (progressRatio < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return (
    <div className="text-center">
      <div className="text-4xl font-bold mb-2 flex items-center justify-center">
        {count}
        {suffix}
      </div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
};

export const StatsCounter = () => {
  return (
    <div className="w-full py-12 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter value={10000} suffix="+" label="Happy Customers" />
          <StatCounter value={500000} suffix="+" label="Invoices Created" />
          <StatCounter value={99} suffix="%" label="Customer Satisfaction" />
          <StatCounter value={50} suffix="%" label="Time Saved" />
        </div>
      </div>
    </div>
  );
};
