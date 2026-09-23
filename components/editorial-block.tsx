'use client';

import { motion } from 'motion/react';
import MagneticLink from './magnetic-link';
import StitchDivider from './stitch-divider';

const textStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const maskReveal = {
  hidden: { y: '110%' },
  show: {
    y: '0%',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function EditorialBlock({
  eyebrow,
  title,
  copy,
  ctaLabel,
  href,
  imageUrl,
  imageAlt,
  reverse = false,
}: {
  eyebrow?: string | null;
  title: string;
  copy?: string | null;
  ctaLabel?: string | null;
  href?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  reverse?: boolean;
}) {
  const hasButton = !!ctaLabel && !!href;

  const textContent = (
    <motion.div variants={textStagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10% 0px' }}>
      {eyebrow && (
        <motion.p variants={fadeUp} className="font-mono-label text-[11px] uppercase text-brass mb-4">
          {eyebrow}
        </motion.p>
      )}
      <h2 className="font-display font-light text-3xl md:text-4xl text-espresso leading-tight overflow-hidden">
        <motion.span variants={maskReveal} className="block">
          {title}
        </motion.span>
      </h2>
      {copy && (
        <motion.p variants={fadeUp} className="mt-5 text-umber leading-relaxed">
          {copy}
        </motion.p>
      )}
      {hasButton && (
        <motion.div variants={fadeUp}>
          <MagneticLink
            href={href!}
            className="stitch-underline font-mono-label text-[12px] uppercase text-espresso inline-block mt-7"
          >
            {ctaLabel}
          </MagneticLink>
        </motion.div>
      )}
    </motion.div>
  );

  if (!imageUrl) {
    return (
      <section>
        <StitchDivider />
        <div className="px-6 md:px-16 py-16 md:py-24 max-w-2xl mx-auto text-center">{textContent}</div>
      </section>
    );
  }

  return (
    <section>
      <StitchDivider />
      <div
        className={`mx-auto max-w-6xl flex flex-col md:flex-row md:items-center gap-8 md:gap-14 px-6 md:px-16 py-12 md:py-20 ${
          reverse ? 'md:flex-row-reverse' : ''
        }`}
      >
        <div className="w-full md:w-1/2 min-w-0">
          <div className="relative aspect-4/3 overflow-hidden">
            <img src={imageUrl} alt={imageAlt ?? title} className="h-full w-full object-cover object-center" />
            <motion.div
              initial={{ scaleX: 1 }}
              whileInView={{ scaleX: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
              style={{ originX: reverse ? 1 : 0 }}
              className="absolute inset-0 bg-ivory"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 min-w-0">
          <div className="max-w-lg">{textContent}</div>
        </div>
      </div>
    </section>
  );
}
