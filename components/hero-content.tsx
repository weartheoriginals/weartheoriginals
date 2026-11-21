'use client';

import { motion } from 'motion/react';
import MagneticLink from './magnetic-link';

const ctaReveal = {
  hidden: { y: 16, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HeroContent({ imageUrl, mobileImageUrl }: { imageUrl: string; mobileImageUrl: string | null }) {
  return (
    <section className="relative w-full overflow-hidden bg-espresso">
      <picture>
        <source media="(min-width: 768px)" srcSet={imageUrl} />
        <img
          src={mobileImageUrl ?? imageUrl}
          alt="Hand-stitched leather jacket, detail of the collar and lapel"
          className="block w-full h-[85svh] md:h-auto md:max-h-[calc(100svh-5rem)] object-cover object-center"
        />
      </picture>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-espresso/80 via-transparent to-transparent" />

      <motion.div
        variants={ctaReveal}
        initial="hidden"
        animate="show"
        className="absolute inset-x-0 bottom-0 mx-auto max-w-350 px-6 md:px-10 pb-8 md:pb-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8"
      >
        <MagneticLink
          href="/c/mens-leather-jackets"
          className="stitch-underline font-mono-label text-[12px] uppercase text-ivory"
        >
          Shop men
        </MagneticLink>
        <MagneticLink
          href="/c/womens-leather-jackets"
          className="stitch-underline font-mono-label text-[12px] uppercase text-ivory/70 hover:text-ivory"
        >
          Shop women
        </MagneticLink>
      </motion.div>
    </section>
  );
}
