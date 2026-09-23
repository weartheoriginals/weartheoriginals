export default function CraftMarquee() {
  const items = ['Hand-Cut', 'Hand-Stitched', 'Full-Grain', 'Made to Order'];
  const track = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden border-y border-espresso/10 bg-ivory py-4">
      <div className="flex w-max animate-marquee">
        {track.map((label, i) => (
          <span
            key={i}
            className="flex items-center font-mono-label text-[11px] uppercase text-umber px-6 whitespace-nowrap"
          >
            {label}
            <span className="ml-6 text-brass">—</span>
          </span>
        ))}
      </div>
    </div>
  );
}
