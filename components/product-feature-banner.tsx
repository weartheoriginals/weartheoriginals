export default function ProductFeatureBanner({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  return (
    <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="flex min-h-48 flex-col justify-center bg-linear-to-br from-espresso to-saddle p-8 md:p-10">
        <p className="font-mono-label text-xs uppercase tracking-widest text-brass">
          OGNLS
        </p>
        <h2 className="mt-3 font-display font-light text-3xl md:text-4xl text-ivory">
          Premium Genuine Leather
        </h2>
        <p className="mt-2 text-ivory/80">Soft. Durable. Timeless.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-umber/5 p-4 md:grid-cols-4 md:gap-4 md:p-6">
        {images.map((url, i) => (
          <div key={url + i} className="aspect-4/5 overflow-hidden bg-umber/10">
            <img src={url} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
