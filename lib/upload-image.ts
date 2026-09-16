import { supabaseClient } from '@/lib/supabase';

export async function uploadToBucket(file: File, bucket: string, pathPrefix: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabaseClient.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabaseClient.storage.from(bucket).getPublicUrl(fileName);

  return publicUrl;
}

export async function uploadToProductImagesBucket(file: File, pathPrefix: string): Promise<string> {
  return uploadToBucket(file, 'product-images', pathPrefix);
}
