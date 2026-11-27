import Link from 'next/link';
import ZoomReveal from './zoom-reveal';

export type CategoryTile = {
  name: string;
  slug: string;
  image_url: string | null;
};

export default function CategoryTiles({ categories }: { categories: CategoryTile[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-[#efe3d3] px-3 py-3 md:px-4 md:py-4">
      <div className="shelf-scroll flex gap-3 overflow-x-auto">
        {categories.map(category => (
          <Link
            key={category.slug}
            href={`/c/${category.slug}`}
            className="shelf-item relative block aspect-4/5 w-[62%] shrink-0 overflow-hidden bg-umber/10 sm:w-[40%] md:w-[calc((100%-3rem)/5)]"
          >
            {category.image_url && (
              <ZoomReveal className="absolute inset-0">
                <img src={category.image_url} alt={category.name} className="h-full w-full object-cover object-center" />
              </ZoomReveal>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#2b1608]/85 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 px-3 pb-4 text-center text-ivory">
              <h3 className="font-display text-[15px] uppercase leading-tight md:text-base">{category.name}</h3>
              <p className="mt-3 text-[11px] uppercase tracking-wide">Shop now</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
