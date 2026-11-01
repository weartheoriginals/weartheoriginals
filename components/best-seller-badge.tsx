export default function BestSellerBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-block -rotate-6 bg-brass p-1 shadow-sm ${className}`}>
      <span className="block border border-dashed border-ivory/70 px-2.5 py-1 font-mono-label text-[10px] uppercase tracking-widest text-ivory">
        Best Seller
      </span>
    </span>
  );
}
