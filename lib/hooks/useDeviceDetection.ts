"use client";

import { useState, useEffect } from "react";

export function useDeviceDetection() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check for touch capability
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Check for mobile screen size
    const checkMobile = () => window.innerWidth <= 768;

    setIsTouchDevice(hasTouch);
    setIsMobile(checkMobile());

    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isTouchDevice, isMobile };
}
