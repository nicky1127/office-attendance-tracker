"use client";

import { useEffect, useState, useRef } from "react";

interface ConfettiCelebrationProps {
  trigger: boolean;
  duration?: number;
  intensity?: "low" | "medium" | "high" | "extreme";
  particleCount?: number; // For direct control
}

// Using dynamic import for canvas-confetti as it's a client-side only library
const ConfettiCelebration = ({
  trigger,
  duration = 3000,
  intensity = "medium",
  particleCount: customParticleCount,
}: ConfettiCelebrationProps) => {
  const [confetti, setConfetti] = useState<any>(null);
  const confettiShown = useRef(false);

  // Determine particle count based on intensity
  const getParticleCount = () => {
    if (customParticleCount !== undefined) return customParticleCount;

    switch (intensity) {
      case "low":
        return 50;
      case "medium":
        return 100;
      case "high":
        return 200;
      case "extreme":
        return 300;
      default:
        return 100;
    }
  };

  // Get continuous particle count (used for the ongoing effect)
  const getContinuousParticleCount = () => {
    return getParticleCount() / 2; // Half as many for the continuous effect
  };

  // Dynamically load the confetti library
  useEffect(() => {
    import("canvas-confetti").then((confettiModule) => {
      setConfetti(() => confettiModule.default);
    });
  }, []);

  // Trigger the confetti when the trigger prop changes to true
  useEffect(() => {
    // Only proceed if confetti is loaded and trigger is true
    if (!confetti || !trigger || confettiShown.current) return;

    // Mark as shown so it doesn't trigger again for the same achievement
    confettiShown.current = true;

    // Fire the confetti
    const end = Date.now() + duration;
    const particleCount = getParticleCount();
    const continuousParticleCount = getContinuousParticleCount();

    // Initial burst
    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Set up interval for continuous effect
    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      // Left side
      confetti({
        particleCount: continuousParticleCount,
        angle: Math.random() * 60 + 60,
        spread: 70,
        origin: { x: 0 },
      });

      // Right side
      confetti({
        particleCount: continuousParticleCount,
        angle: Math.random() * 60 + 240,
        spread: 70,
        origin: { x: 1 },
      });
    }, 250);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, [confetti, trigger, duration, intensity, customParticleCount]);

  // Reset the shown state when the trigger turns off
  useEffect(() => {
    if (!trigger) {
      confettiShown.current = false;
    }
  }, [trigger]);

  // This component doesn't render anything visible
  return null;
};

export default ConfettiCelebration;
