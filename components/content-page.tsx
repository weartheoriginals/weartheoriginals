import type { ReactNode } from "react";

export function ContentPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-350 px-6 md:px-10 py-16 md:py-20">
      <h1 className="font-display text-3xl md:text-4xl text-espresso mb-10">
        {title}
      </h1>
      <div className="prose-content max-w-2xl">{children}</div>
    </div>
  );
}

export function ContentSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="font-mono-label text-[11px] uppercase text-brass mb-3">
        {heading}
      </h2>
      <div className="text-sm text-umber leading-relaxed space-y-3">
        {children}
      </div>
      <hr className="stitch-divider mt-10" />
    </section>
  );
}

export function ContentTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-espresso/20">
            {headers.map((h) => (
              <th
                key={h}
                className="font-mono-label text-[10px] uppercase text-brass text-left py-2 pr-4 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-espresso/10">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 text-umber whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
