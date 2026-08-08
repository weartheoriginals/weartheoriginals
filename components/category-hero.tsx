export default function CategoryHero({
  eyebrow,
  title,
  copy,
  imageUrl,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  imageUrl: string;
  imageAlt: string;
}) {
  return (
    <section className="border-b border-espresso/10 bg-ivory">
      <div className="flex flex-col md:flex-row md:min-h-125">
        <div className="w-full md:w-[45%] flex items-center order-2 md:order-1">
          <div className="px-6 md:px-16 py-12 md:py-0 max-w-lg">
            <p className="font-mono-label text-[11px] uppercase text-brass mb-4">{eyebrow}</p>
            <h1 className="font-display font-light text-4xl md:text-5xl text-espresso leading-[1.05]">{title}</h1>
            <p className="mt-5 text-umber leading-relaxed">{copy}</p>
          </div>
        </div>
        <div className="w-full md:w-[55%] aspect-4/3 md:aspect-auto order-1 md:order-2">
          <img src={imageUrl} alt={imageAlt} className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}
