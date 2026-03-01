"use client";

import { useState, useEffect } from "react";
import { LAUNCH_DATE, getLaunchCountdown } from "@/lib/constants";

export function CountdownBanner() {
  const [countdown, setCountdown] = useState(getLaunchCountdown());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCountdown(getLaunchCountdown());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted || countdown.total <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-tradestock-900 via-tradestock-800 to-tradestock-900 text-white py-3 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span className="text-sm font-medium text-tradestock-100">
          Platform Launch:
        </span>
        <div className="flex items-center gap-2">
          <div className="countdown-box">
            <span className="countdown-number">{countdown.days}</span>
            <span className="countdown-label">Days</span>
          </div>
          <span className="text-2xl font-bold text-tradestock-300">:</span>
          <div className="countdown-box">
            <span className="countdown-number">
              {countdown.hours.toString().padStart(2, "0")}
            </span>
            <span className="countdown-label">Hrs</span>
          </div>
          <span className="text-2xl font-bold text-tradestock-300">:</span>
          <div className="countdown-box">
            <span className="countdown-number">
              {countdown.minutes.toString().padStart(2, "0")}
            </span>
            <span className="countdown-label">Min</span>
          </div>
          <span className="text-2xl font-bold text-tradestock-300">:</span>
          <div className="countdown-box">
            <span className="countdown-number">
              {countdown.seconds.toString().padStart(2, "0")}
            </span>
            <span className="countdown-label">Sec</span>
          </div>
        </div>
      </div>
    </div>
  );
}
