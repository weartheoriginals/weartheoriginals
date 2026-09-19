'use client';

import { useEffect, useState } from 'react';

export default function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge ${productName} image`}
        className="block aspect-square w-full overflow-hidden bg-umber/5 cursor-zoom-in"
      >
        <img
          src={images[activeIndex]}
          alt={`${productName} — view ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />
      </button>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View ${productName} image ${index + 1}`}
              aria-current={index === activeIndex}
              className={`aspect-square overflow-hidden bg-umber/5 transition-opacity ${
                index === activeIndex ? 'opacity-100 ring-1 ring-saddle' : 'opacity-60 hover:opacity-90'
              }`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} enlarged image`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/90 p-4"
          onClick={() => setOpen(false)}
        >
          <img
            src={images[activeIndex]}
            alt={`${productName} — view ${activeIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 font-mono-label text-[12px] uppercase text-ivory"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
