import { getSupabaseAdmin } from '@/lib/supabase';

export default async function MaterialsPage() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: videos } = await supabaseAdmin.from('craft_videos').select('*').order('display_order', { ascending: true });

  return (
    <div>
      <section className="border-b border-espresso/10 py-16 md:py-24 text-center px-6">
        <p className="font-mono-label text-[11px] uppercase text-brass mb-4">Materials</p>
        <h1 className="font-display font-light text-4xl md:text-5xl text-espresso max-w-2xl mx-auto leading-tight">
          Full-grain, vegetable-tanned, built to age well.
        </h1>
      </section>

      {(videos ?? []).map((video, i) => (
        <section key={video.id} className="border-b border-espresso/10">
          <div className={`flex flex-col md:flex-row ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2 aspect-4/3 md:aspect-auto bg-espresso">
              <video src={video.video_url} className="h-full w-full object-cover" controls playsInline muted loop />
            </div>
            <div className="w-full md:w-1/2 flex items-center">
              <div className="px-6 md:px-16 py-16 md:py-0 max-w-lg">
                <h2 className="font-display font-light text-3xl md:text-4xl text-espresso leading-tight">{video.title}</h2>
                {video.caption && <p className="mt-5 text-umber leading-relaxed">{video.caption}</p>}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
