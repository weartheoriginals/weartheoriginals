export default function StarRating({
  rating,
  count,
  compact = false,
}: {
  rating: number;
  count: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-umber ${compact ? "text-xs" : "text-sm"}`}
    >
      <div className="flex" role="img" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <svg
            key={n}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={n <= Math.round(rating) ? "text-brass" : "text-espresso/20"}
          >
            <path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5 7.5-.7z" />
          </svg>
        ))}
      </div>
      <span>
        {rating.toFixed(1)} ({count}
        {compact ? "" : " reviews"})
      </span>
    </div>
  );
}
