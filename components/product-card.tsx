import Link from 'next/link';

export type ProductCardData = {
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  tag?: string; // e.g. "Limited Stock", "New"
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProductCard({
  product,
  variant = 'shelf',
  size = 'default',
}: {
  product: ProductCardData;
  /** 'shelf' = fixed width for horizontal-scroll rows. 'grid' = fluid width for CSS grid layouts. */
  variant?: 'shelf' | 'grid';
  /** 'compact' = smaller type/spacing for dense grids (5+ across). */
  size?: 'default' | 'compact';
}) {
  const widthClasses = variant === 'shelf' ? 'shelf-item shrink-0 w-70 md:w-[320px]' : 'w-full';
  const isCompact = size === 'compact';

  return (
    <Link href={`/p/${product.slug}`} className={`group ${widthClasses}`}>
      <div className="aspect-3/4 w-full overflow-hidden bg-umber/5">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className={isCompact ? 'mt-2.5' : 'mt-4'}>
        <h3 className={`font-display text-espresso stitch-underline inline-block ${isCompact ? 'text-sm' : 'text-lg'}`}>
          {product.name}
        </h3>
        <p className={`mt-1 font-mono-label text-umber ${isCompact ? 'text-[11px]' : 'text-[13px]'}`}>
          {formatPrice(product.price)}
        </p>
        {product.tag && <p className="mt-1 font-mono-label text-[10px] uppercase text-brass">{product.tag}</p>}
      </div>
    </Link>
  );
}
