"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function ScrollExpandImage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ["inset(0% 14% round 24px)", "inset(0% 0% round 0px)"],
  );
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);

  return (
    <section className="pt-16 md:pt-28">
      <div className="mx-auto max-w-350 px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 md:items-end">
        <h2 className="font-display font-medium text-4xl md:text-6xl text-espresso leading-[1.05]">
          Made to be worn for decades.
        </h2>
        <p className="text-umber leading-relaxed md:max-w-md md:justify-self-end">
          Every OGLS piece starts with a full-grain hide and ends with hand finishing. No
          shortcuts, no seasons to chase. Just leather that looks better the longer you
          own it.
        </p>
      </div>

      <div ref={ref} className="mt-10 md:mt-16 overflow-hidden px-4 md:px-0">
        <motion.div
          style={{ clipPath }}
          className="aspect-4/3 md:aspect-auto md:h-[90vh]"
        >
          <motion.img
            src="/images/image-full.jpeg"
            alt="Black leather jacket with the OGLS mark"
            style={{ scale }}
            className="h-full w-full object-cover object-center"
          />
        </motion.div>
      </div>
    </section>
  );
}
