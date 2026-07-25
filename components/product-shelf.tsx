import ProductCard, { ProductCardData } from './product-card';

export default function ProductShelf({
  title,
  eyebrow,
  products,
}: {
  title: string;
  eyebrow?: string;
  products: ProductCardData[];
}) {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-350 px-6 md:px-10">
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            {eyebrow && <p className="font-mono-label text-[11px] uppercase text-brass mb-2">{eyebrow}</p>}
            <h2 className="font-display font-light text-3xl md:text-4xl text-espresso">{title}</h2>
          </div>
        </div>

        <div className="shelf-scroll flex gap-6 md:gap-8 overflow-x-auto pb-4 -mx-6 px-6 md:-mx-10 md:px-10">
          {products.map(product => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
