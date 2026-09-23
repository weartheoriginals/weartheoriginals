"use client";

import { motion } from "motion/react";
import MagneticLink from "./magnetic-link";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const lineReveal = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HeroContent({ imageUrl }: { imageUrl: string }) {
  return (
    <section className="relative h-[70vh] min-h-105 md:h-[80vh] md:max-h-180 w-full overflow-hidden bg-espresso">
      <motion.img
        src={imageUrl}
        alt="Hand-stitched leather jacket, detail of the collar and lapel"
        className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 12, ease: "easeOut" }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-espresso/90 via-espresso/50 to-espresso/10" />
      <div className="absolute inset-0 bg-linear-to-r from-espresso/60 via-transparent to-transparent md:from-espresso/50" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative h-full mx-auto max-w-350 px-6 md:px-10 flex flex-col justify-end pb-16 md:pb-24"
      >
        <div className="overflow-hidden">
          <motion.p
            variants={lineReveal}
            className="font-mono-label text-[12px] uppercase text-ivory/90 mb-4 drop-shadow-sm"
          >
            Autumn Collection — Hand-Cut, Hand-Stitched
          </motion.p>
        </div>

        <h1 className="font-display font-light text-ivory text-4xl sm:text-5xl md:text-7xl leading-[1.05] max-w-2xl drop-shadow-sm">
          <span className="overflow-hidden block">
            <motion.span variants={lineReveal} className="block">
              Leather made to
            </motion.span>
          </span>
          <span className="overflow-hidden block">
            <motion.span variants={lineReveal} className="block">
              outlast the trend.
            </motion.span>
          </span>
        </h1>

        <motion.div
          variants={lineReveal}
          className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8"
        >
          <MagneticLink
            href="/c/leather-accessories"
            className="stitch-underline font-mono-label text-[12px] uppercase text-ivory"
          >
            Shop Leather Accessories
          </MagneticLink>
          <MagneticLink
            href="/about"
            className="stitch-underline font-mono-label text-[12px] uppercase text-ivory/70 hover:text-ivory"
          >
            Our Craft
          </MagneticLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
