import Link from 'next/link';

export default function HeroContent({ imageUrl, mobileImageUrl }: { imageUrl: string; mobileImageUrl: string | null }) {
  return (
    <section className="relative w-full h-svh overflow-hidden bg-espresso">
      <picture>
        <source media="(min-width: 768px)" srcSet={imageUrl} />
        <img
          src={mobileImageUrl ?? imageUrl}
          alt="OGNLS leather collection"
          className="block h-full w-full object-cover object-center"
        />
      </picture>

      {/* Slight gradients: top for the header links, bottom for the button */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-linear-to-b from-[#241a12]/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-[#241a12]/65 to-transparent" />

      <div className="absolute inset-x-0 bottom-[10svh] md:bottom-[12svh]">
        <div className="flex justify-center px-6">
          <Link
            href="/c/mens-leather-jackets"
            className="inline-flex items-center gap-3 border border-ivory/80 px-6 py-3 font-display text-[14px] uppercase tracking-wide text-ivory transition-colors duration-200 hover:bg-ivory/15"
          >
            Explore Collection
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
