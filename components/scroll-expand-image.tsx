"use client";

import { motion } from "motion/react";

export default function ScrollExpandImage() {
  return (
    <section className="pt-16 md:pt-28">
      <div className="mx-auto max-w-350 px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 md:items-end">
        <h2 className="font-display font-medium text-4xl md:text-6xl text-espresso leading-[1.05]">
          Made to be worn for decades.
        </h2>
        <p className="text-umber leading-relaxed md:max-w-md md:justify-self-end">
          Every OGLS piece starts with a full-grain hide and ends with hand
          finishing. No shortcuts, no seasons to chase. Just leather that looks
          better the longer you own it.
        </p>
      </div>

      <div className="mx-auto max-w-350 mt-10 md:mt-16 px-4 md:px-10">
        <div className="relative overflow-hidden rounded-2xl aspect-4/3 md:aspect-auto md:h-[85vh]">
          <motion.img
            src="/images/image-full.jpeg"
            alt="Black leather jacket with the OGLS mark"
            initial={{ scale: 1.15 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full object-cover object-center"
          />
          <motion.div
            initial={{ y: "0%" }}
            whileInView={{ y: "-100%" }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-0 bg-ivory"
          />
        </div>
      </div>
    </section>
  );
}
