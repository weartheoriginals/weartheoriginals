import { supabaseClient } from '@/lib/supabase';

// Uploads a file to the product-images bucket and returns its public URL.
// Used by admin UI before registering the image via POST /api/admin/products/[id]/images
// (that route expects an already-hosted image_url, not a file).
export async function uploadToProductImagesBucket(file: File, pathPrefix: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabaseClient.storage.from('product-images').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabaseClient.storage.from('product-images').getPublicUrl(fileName);

  return publicUrl;
}
