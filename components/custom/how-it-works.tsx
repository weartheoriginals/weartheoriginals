const STEPS = [
  { title: 'Submit Request', copy: 'Fill out the form and share your idea.' },
  { title: 'We Review', copy: 'Our team checks feasibility and details.' },
  { title: 'You Get a Quote', copy: "We'll send you pricing, timeline and next steps." },
  { title: 'You Approve', copy: 'Confirm the design and make payment.' },
  { title: 'Production', copy: 'Your custom piece is created with care.' },
];

export default function HowItWorks() {
  return (
    <section className="bg-espresso text-ivory">
      <div className="mx-auto max-w-350 px-6 md:px-10 py-16 md:py-20 grid gap-12 md:grid-cols-[200px_1fr] md:gap-16">
        <div>
          <p className="font-mono-label text-[11px] uppercase tracking-widest text-ivory/60">The Process</p>
          <h2 className="mt-3 font-display font-light text-3xl md:text-4xl">How It Works</h2>
        </div>
        <ol className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/40 font-mono-label text-xs">
                {i + 1}
              </span>
              <p className="mt-4 text-base">{s.title}</p>
              <p className="mt-2 text-sm text-ivory/60 leading-relaxed">{s.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
