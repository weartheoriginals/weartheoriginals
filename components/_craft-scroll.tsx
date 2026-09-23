'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const panels = [
  { src: '/custom/colors.jpeg', label: 'Hand-Stitched Seams' },
  { src: '/custom/design.jpeg', label: 'Full-Grain Tanning' },
  { src: '/custom/hardware.jpeg', label: 'Solid Brass Hardware' },
  { src: '/custom/stitching.jpeg', label: 'The Finished Piece' },
];

export default function CraftScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const distance = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${distance}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-espresso">
      <div ref={trackRef} className="flex h-screen w-max">
        {panels.map(panel => (
          <div key={panel.src} className="relative h-screen w-screen shrink-0">
            <img src={panel.src} alt={panel.label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-espresso/30" />
            <p className="absolute bottom-16 left-10 font-mono-label text-[12px] uppercase text-ivory drop-shadow-sm">
              {panel.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
