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

export default function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/p/${product.slug}`} className="shelf-item group shrink-0 w-70 md:w-[320px]">
      <div className="aspect-3/4 w-full overflow-hidden bg-umber/5">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4">
        <h3 className="font-display text-lg text-espresso stitch-underline inline-block">{product.name}</h3>
        <p className="mt-1 font-mono-label text-[13px] text-umber">{formatPrice(product.price)}</p>
        {product.tag && <p className="mt-1 font-mono-label text-[10px] uppercase text-brass">{product.tag}</p>}
      </div>
    </Link>
  );
}
