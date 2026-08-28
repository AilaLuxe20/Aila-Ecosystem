"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
};

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 40,
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const getInitialPosition = () => {
    if (direction === "down") {
      return { x: 0, y: -distance };
    }

    if (direction === "left") {
      return { x: distance, y: 0 };
    }

    if (direction === "right") {
      return { x: -distance, y: 0 };
    }

    if (direction === "none") {
      return { x: 0, y: 0 };
    }

    return { x: 0, y: distance };
  };

  const initialPosition = getInitialPosition();

  return (
    <motion.div
      className={className}
      initial={
        shouldReduceMotion
          ? { opacity: 1, x: 0, y: 0 }
          : {
              opacity: 0,
              x: initialPosition.x,
              y: initialPosition.y,
              filter: "blur(10px)",
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.15,
        margin: "0px 0px -80px 0px",
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.9,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
