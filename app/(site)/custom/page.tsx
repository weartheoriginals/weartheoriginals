import CustomRequestForm from '@/components/custom/custom-request-form';
import HowItWorks from '@/components/custom/how-it-works';
import Link from 'next/link';

const CAPABILITIES = [
  {
    label: 'Colors',
    copy: 'Choose from our premium leather color range or request a custom shade.',
    image: '/custom/colors.jpg',
  },
  {
    label: 'Design / Style',
    copy: 'Modify existing styles or create a completely new design.',
    image: '/custom/design.jpg',
  },
  { label: 'Stitching', copy: 'Custom thread colors, patterns and detailing.', image: '/custom/stitching.jpg' },
  {
    label: 'Embroidery',
    copy: 'Add logos, text, or unique designs with precision embroidery.',
    image: '/custom/embroidery.jpg',
  },
  { label: 'Patches', copy: 'Custom patches, logos or artwork.', image: '/custom/patches.jpg' },
  { label: 'Hardware', copy: 'Choose your preferred zippers, buttons and finishes.', image: '/custom/hardware.jpg' },
  { label: 'Names / Initials', copy: 'Personalize with your initials, name or number.', image: '/custom/initials.jpg' },
  { label: 'Measurements', copy: 'Get the perfect fit with custom sizing.', image: '/custom/measurements.jpg' },
  { label: 'Reference Design', copy: 'Share your inspiration or sketches.', image: '/custom/reference.jpg' },
];

function CapabilityCard({ label, copy, image }: (typeof CAPABILITIES)[number]) {
  return (
    <div className="bg-espresso/5">
      <div className="aspect-16/10 overflow-hidden bg-espresso/10">
        <img src={image} alt={label} className="h-full w-full object-cover" />
      </div>
      <div className="p-5">
        <p className="font-mono-label text-[11px] uppercase tracking-widest text-espresso">{label}</p>
        <p className="mt-2 text-sm text-umber leading-relaxed">{copy}</p>
      </div>
    </div>
  );
}

export default async function CustomPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-espresso text-ivory">
        <img src="/custom/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-right opacity-70" />
        <div className="absolute inset-0 bg-linear-to-r from-espresso via-espresso/70 to-transparent" />
        <div className="relative mx-auto max-w-350 px-6 md:px-10 py-20 md:py-32">
          <p className="font-mono-label text-[11px] uppercase tracking-widest text-ivory/70">Customization</p>
          <h1 className="mt-4 font-display font-light text-5xl md:text-7xl uppercase">Make It Yours</h1>
          <p className="mt-5 text-lg md:text-xl">Your idea. Your design. Your OGNLS.</p>
          <p className="mt-3 max-w-md text-ivory/80 leading-relaxed">
            Create a piece designed around your vision. Custom colors, materials, patches, embroidery, hardware and more.
          </p>
          <Link
            href="#request"
            className="mt-8 inline-flex items-center gap-3 bg-ivory text-espresso font-mono-label text-[11px] uppercase tracking-widest px-6 py-4 hover:bg-ivory/90 transition-colors"
          >
            Start Your Custom Request <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* What can be customized */}
      <section className="mx-auto max-w-350 px-6 md:px-10 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="font-mono-label text-[11px] uppercase tracking-widest text-umber">What can be customized?</p>
            <h2 className="mt-3 font-display font-light text-3xl md:text-4xl text-espresso">
              Full Control. Endless Possibilities.
            </h2>
          </div>
          <p className="max-w-xs text-sm text-umber md:text-right">
            From subtle details to bold statements — choose what makes your piece uniquely yours.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {CAPABILITIES.slice(0, 4).map(c => (
            <CapabilityCard key={c.label} {...c} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          {CAPABILITIES.slice(4).map(c => (
            <CapabilityCard key={c.label} {...c} />
          ))}
        </div>
      </section>

      {/* Request form */}
      <section id="request" className="scroll-mt-28 border-t border-espresso/10 bg-espresso/3">
        <div className="mx-auto max-w-350 px-6 md:px-10 py-16 md:py-20">
          <p className="font-mono-label text-[11px] uppercase tracking-widest text-umber">Custom Request</p>
          <h2 className="mt-3 font-display font-light text-3xl md:text-4xl text-espresso">Tell Us About Your Design</h2>
          <div className="mt-10">
            <CustomRequestForm initialProductSlug={product} />
          </div>
        </div>
      </section>

      <HowItWorks />
    </main>
  );
}
