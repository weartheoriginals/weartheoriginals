'use client';

import { useState } from 'react';

export default function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden bg-umber/5">
        <img
          src={images[activeIndex]}
          alt={`${productName} — view ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
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
    </div>
  );
}
