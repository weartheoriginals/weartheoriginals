import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative h-[92vh] min-h-140 w-full overflow-hidden bg-espresso">
      {/* Replace src with real hero photography from Supabase Storage once shot list is ready */}
      <img
        src="https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=2000&auto=format&fit=crop"
        alt="Hand-stitched leather jacket, detail of the collar and lapel"
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-linear-to-t from-espresso/70 via-espresso/10 to-transparent" />

      <div className="relative h-full mx-auto max-w-350 px-6 md:px-10 flex flex-col justify-end pb-16 md:pb-24">
        <p className="font-mono-label text-[11px] uppercase text-brass mb-4">Autumn Collection — Hand-Cut, Hand-Stitched</p>
        <h1 className="font-display font-light text-ivory text-5xl md:text-7xl leading-[1.05] max-w-2xl">
          Leather made to
          <br />
          outlast the trend.
        </h1>
        <div className="mt-8 flex items-center gap-8">
          <Link href="/c/jackets" className="stitch-underline font-mono-label text-[12px] uppercase text-ivory">
            Shop Jackets
          </Link>
          <Link
            href="/about"
            className="stitch-underline font-mono-label text-[12px] uppercase text-ivory/70 hover:text-ivory"
          >
            Our Craft
          </Link>
        </div>
      </div>
    </section>
  );
}
