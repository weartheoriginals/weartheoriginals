export default function BestSellerBadge({ corner = false, className = '' }: { corner?: boolean; className?: string }) {
  if (corner) {
    return (
      <span aria-label="Best Seller" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <span className="absolute -left-9.5 top-5 w-36 -rotate-45 bg-brass py-1 text-center font-mono-label text-[9px] uppercase tracking-widest text-ivory shadow-sm">
          Best Seller
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-block -rotate-6 bg-brass px-3 py-1.5 font-mono-label text-[10px] uppercase tracking-widest text-ivory shadow-sm ${className}`}
    >
      Best Seller
    </span>
  );
}
