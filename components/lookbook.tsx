'use client';

import { useState } from 'react';

export type LookbookImage = { id: string; image_url: string };

export default function Lookbook({ images }: { images: LookbookImage[] }) {
  const [index, setIndex] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);

  if (images.length === 0) return null;

  const go = (dir: 1 | -1) => setIndex(i => (i + dir + images.length) % images.length);

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const diff = e.changedTouches[0].clientX - touchX;
    if (Math.abs(diff) > 50) go(diff < 0 ? 1 : -1);
    setTouchX(null);
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-espresso"
      onTouchStart={e => setTouchX(e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      {images.map((image, i) => (
        <img
          key={image.id}
          src={image.image_url}
          alt="OGNLS lookbook"
          className={`w-full h-auto max-h-[85svh] object-cover object-center ${i === index ? 'block' : 'hidden'}`}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#2b1608]/70 via-[#2b1608]/20 to-transparent" />

      <div className="pointer-events-none absolute inset-y-0 left-0 flex w-full items-center">
        <div className="px-6 md:px-14">
          <h2 className="font-display text-3xl uppercase leading-[1.05] text-ivory md:text-6xl">
            The OGNLS
            <br />
            Lookbook
          </h2>
          <p className="mt-3 text-sm text-ivory md:mt-4 md:text-lg">Timeless Style. Modern Attitude.</p>
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2 md:bottom-6 md:right-8">
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => go(-1)}
            className="flex h-9 w-9 items-center justify-center border border-ivory/70 text-ivory hover:bg-ivory/15"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => go(1)}
            className="flex h-9 w-9 items-center justify-center border border-ivory/70 text-ivory hover:bg-ivory/15"
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}
