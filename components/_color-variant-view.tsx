import type { ColorOption } from "@/lib/product-ui";

export default function ColorVariantView({
  colors,
  selected,
  onSelect,
}: {
  colors: ColorOption[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  return (
    <section className="mt-16 md:mt-20 bg-umber/5 p-6 md:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-10 items-center">
        <div>
          <h2 className="font-display font-light text-2xl md:text-3xl text-espresso">
            Color Variant View
          </h2>
          <p className="mt-3 max-w-xs text-umber">
            Pick a color and the photos above change to match.
          </p>
          <svg
            className="hidden lg:block mt-6 text-espresso"
            width="90"
            height="44"
            viewBox="0 0 90 44"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            aria-hidden="true"
          >
            <path d="M4 4c4 26 34 36 74 32" />
            <path d="M70 30l10 6-9 7" />
          </svg>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {colors.map((c) => {
            const sel = c.name === selected;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={sel}
                onClick={() => onSelect(c.name)}
                className={`text-left border p-1 transition-colors ${
                  sel
                    ? "border-espresso"
                    : "border-transparent hover:border-espresso/30"
                }`}
              >
                <span className="block aspect-3/4 overflow-hidden bg-umber/5">
                  <img
                    src={c.hero}
                    alt={c.name}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span
                  className={`mt-2 block text-center text-xs ${sel ? "text-espresso" : "text-umber"}`}
                >
                  {c.name}
                  {sel && " (Selected)"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
