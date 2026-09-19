import Link from 'next/link';

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
      {eyebrow && <p className="font-mono-label text-[11px] uppercase text-brass mb-4">{eyebrow}</p>}
      <h2 className="font-display font-light text-3xl md:text-4xl text-espresso leading-tight">{title}</h2>
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

  // No image: full-width centered text block
  if (!imageUrl) {
    return (
      <section className="border-t border-espresso/10">
        <div className="px-6 md:px-16 py-16 md:py-24 max-w-2xl mx-auto text-center">{textContent}</div>
      </section>
    );
  }

  return (
    <section className="border-t border-espresso/10">
      <div className={`flex flex-col md:flex-row ${reverse ? 'md:flex-row-reverse' : ''}`}>
        <div className="w-full md:w-1/2 aspect-4/3 md:aspect-auto">
          <img src={imageUrl} alt={imageAlt ?? title} className="h-full w-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 flex items-center">
          <div className="px-6 md:px-16 py-16 md:py-0 max-w-lg">{textContent}</div>
        </div>
      </div>
    </section>
  );
}
