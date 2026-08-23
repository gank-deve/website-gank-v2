"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: [0.21, 0.65, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  kicker,
  title,
}: {
  kicker: string;
  title: React.ReactNode;
}) {
  return (
    <Reveal>
      <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase">
        {kicker}
      </p>
      <h2 className="font-heading mt-3 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
    </Reveal>
  );
}
