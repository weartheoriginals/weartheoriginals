export type LookbookImage = { id: string; image_url: string };

export default function Lookbook({ images }: { images: LookbookImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-espresso">
      <div className="shelf-scroll flex overflow-x-auto overscroll-x-contain">
        {images.map(image => (
          <div key={image.id} className="w-full shrink-0 snap-start shelf-item">
            <img
              src={image.image_url}
              alt="OGNLS lookbook"
              className="block w-full h-[65svh] md:h-[85svh] object-cover object-center"
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#2b1608]/70 via-[#2b1608]/20 to-transparent" />

      <div className="pointer-events-none absolute inset-y-0 left-0 flex w-full items-center">
        <div className="px-6 md:px-14">
          <h2 className="font-display text-3xl uppercase leading-[1.05] text-ivory md:text-6xl">
            The OGNLS
            <br />
            Lookbook
          </h2>
          <p className="mt-3 text-sm text-ivory md:mt-4 md:text-lg">Timeless Style. Modern Attitude.</p>
        </div>
      </div>
    </section>
  );
}
