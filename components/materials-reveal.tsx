"use client";

import StitchDivider from "@/components/stitch-divider";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

type CraftMediaItem = {
  id: string;
  title: string;
  caption: string | null;
  media_type: "video" | "image";
  video_url: string | null;
  image_url: string | null;
};

const mediaReveal = {
  hidden: { opacity: 0, scale: 1.04 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

const textStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
} as const;

const maskReveal = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export default function MaterialsReveal({
  item,
  reverse,
  index,
}: {
  item: CraftMediaItem;
  reverse: boolean;
  index: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaWrapRef = useRef(null);
  const inView = useInView(mediaWrapRef, { once: false, margin: "-20% 0px" });

  if (inView) videoRef.current?.play().catch(() => {});
  else videoRef.current?.pause();

  return (
    <section className="mx-auto max-w-350 px-6 md:px-10">
      {index > 0 && <StitchDivider />}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center py-14 md:py-24 ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <motion.div
          ref={mediaWrapRef}
          variants={mediaReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="relative aspect-4/5 md:aspect-4/3 overflow-hidden rounded-2xl bg-espresso shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]"
        >
          {item.media_type === "video" ? (
            <video
              ref={videoRef}
              src={item.video_url ?? undefined}
              className="h-full w-full object-cover"
              playsInline
              muted
              loop
            />
          ) : (
            <img
              src={item.image_url ?? undefined}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          )}
        </motion.div>

        <motion.div
          variants={textStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="max-w-md md:px-4"
        >
          <div className="overflow-hidden">
            <motion.h2
              variants={maskReveal}
              className="font-display font-light text-2xl md:text-3xl text-espresso leading-tight"
            >
              {item.title}
            </motion.h2>
          </div>
          {item.caption && (
            <motion.p
              variants={fadeUp}
              className="mt-4 text-sm md:text-base text-umber leading-relaxed"
            >
              {item.caption}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
