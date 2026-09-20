import { getSupabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';

export default async function Hero() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: banner } = await supabaseAdmin.from('site_banner').select('image_url').maybeSingle();
  const imageUrl =
    banner?.image_url ?? 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=2000&auto=format&fit=crop';

  return (
    <section className="relative h-[70vh] min-h-105 md:h-[80vh] md:max-h-180 w-full overflow-hidden bg-espresso">
      <img
        src={imageUrl}
        alt="Hand-stitched leather jacket, detail of the collar and lapel"
        className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-espresso/90 via-espresso/50 to-espresso/10" />
      <div className="absolute inset-0 bg-linear-to-r from-espresso/60 via-transparent to-transparent md:from-espresso/50" />

      <div className="relative h-full mx-auto max-w-350 px-6 md:px-10 flex flex-col justify-end pb-16 md:pb-24">
        <p className="font-mono-label text-[12px] uppercase text-ivory/90 mb-4 drop-shadow-sm">
          Autumn Collection — Hand-Cut, Hand-Stitched
        </p>
        <h1 className="font-display font-light text-ivory text-4xl sm:text-5xl md:text-7xl leading-[1.05] max-w-2xl drop-shadow-sm">
          Leather made to
          <br />
          outlast the trend.
        </h1>
        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
          <Link href="/c/leather-accessories" className="stitch-underline font-mono-label text-[12px] uppercase text-ivory">
            Shop Leather Accessories
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
