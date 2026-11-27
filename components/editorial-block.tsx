import Link from 'next/link';
import ZoomReveal from './zoom-reveal';

const BEIGE = 'bg-[#eadfce]';

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

  const text = (
    <div className="max-w-md text-[#2b1608]">
      {eyebrow && (
        <p className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-wide">
          {eyebrow}
          <span aria-hidden className="h-px w-10 bg-[#2b1608]/30" />
        </p>
      )}
      <h2 className="font-display text-2xl uppercase leading-[1.1] md:text-4xl">{title}</h2>
      {copy && <p className="mt-4 text-sm leading-relaxed md:text-base">{copy}</p>}
      {hasButton && (
        <Link
          href={href!}
          className="mt-6 inline-flex items-center gap-3 border border-[#2b1608]/70 px-4 py-2.5 text-[11px] uppercase tracking-wide transition-colors duration-200 hover:bg-[#2b1608]/10"
        >
          {ctaLabel}
          <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );

  if (!imageUrl) {
    return (
      <section className={`${BEIGE} px-6 py-14 md:py-20`}>
        <div className="mx-auto flex max-w-2xl justify-center text-center">{text}</div>
      </section>
    );
  }

  return (
    <section
      className={`grid grid-cols-1 border-t border-[#2b1608]/20  md:min-h-80 lg:min-h-90 ${
        reverse ? 'md:grid-cols-[2fr_3fr]' : 'md:grid-cols-[3fr_2fr]'
      }`}
    >
      <div className={`relative h-56 overflow-hidden md:h-auto ${reverse ? 'md:order-2' : ''}`}>
        <ZoomReveal className="absolute inset-0">
          <img src={imageUrl} alt={imageAlt ?? title} className="h-full w-full object-cover object-center" />
        </ZoomReveal>
        <div
          className={`pointer-events-none absolute inset-y-0 hidden w-1/3 md:block ${
            reverse
              ? 'left-0 bg-linear-to-r from-[#eadfce] to-transparent'
              : 'right-0 bg-linear-to-l from-[#eadfce] to-transparent'
          }`}
        />
      </div>

      <div className={`${BEIGE} flex items-center px-6 py-10 md:px-14 md:py-12 ${reverse ? 'md:order-1' : ''}`}>{text}</div>
    </section>
  );
}
