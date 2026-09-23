"use client";

import { motion } from "motion/react";
import Link from "next/link";

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
    <>
      {eyebrow && (
        <p className="font-mono-label text-[11px] uppercase text-brass mb-4">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display font-light text-3xl md:text-4xl text-espresso leading-tight">
        {title}
      </h2>
      {copy && <p className="mt-5 text-umber leading-relaxed">{copy}</p>}
      {hasButton && (
        <Link
          href={href!}
          className="stitch-underline font-mono-label text-[12px] uppercase text-espresso inline-block mt-7"
        >
          {ctaLabel}
        </Link>
      )}
    </>
  );

  if (!imageUrl) {
    return (
      <section className="border-t border-espresso/10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="px-6 md:px-16 py-16 md:py-24 max-w-2xl mx-auto text-center"
        >
          {textContent}
        </motion.div>
      </section>
    );
  }

  return (
    <section className="border-t border-espresso/10">
      <div
        className={`mx-auto max-w-6xl flex flex-col md:flex-row md:items-center gap-8 md:gap-14 px-6 md:px-16 py-12 md:py-20 ${
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        <motion.div
          initial={{ opacity: 0, x: reverse ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full md:w-1/2 min-w-0"
        >
          <div className="aspect-4/3 overflow-hidden">
            <img
              src={imageUrl}
              alt={imageAlt ?? title}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: reverse ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full md:w-1/2 min-w-0"
        >
          <div className="max-w-lg">{textContent}</div>
        </motion.div>
      </div>
    </section>
  );
}
