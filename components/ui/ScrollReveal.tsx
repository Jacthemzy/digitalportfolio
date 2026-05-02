"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Props {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export default function ScrollReveal({ children, delay = 0, direction = "up", className = "" }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const dirs = {
    up: { y: 50, x: 0 }, down: { y: -50, x: 0 },
    left: { x: 50, y: 0 }, right: { x: -50, y: 0 }, none: { x: 0, y: 0 },
  };
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
