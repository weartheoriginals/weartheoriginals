import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export type CustomRequestFields = {
  full_name: string;
  email: string;
  phone: string;
  product_type: string;
  product_type_other?: string;
  product_id?: string;
  color?: string;
  material?: string;
  patches?: string;
  embroidery?: string;
  hardware?: string;
  measurements?: string;
  other_requests?: string;
};

export async function submitCustomRequest(fields: CustomRequestFields, files: File[]) {
  const supabase = createSupabaseBrowserClient();

  // 1. create request
  const res = await fetch('/api/custom-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...fields,
      files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Could not create request');
  const { requestId, requestNumber, uploads } = json.data;

  // 2. upload files directly to Supabase Storage
  const results = await Promise.all(
    uploads.map((u: { path: string; token: string }, i: number) =>
      supabase.storage.from('custom-request-files').uploadToSignedUrl(u.path, u.token, files[i]),
    ),
  );
  const failed = results.find(r => r.error);
  if (failed?.error) throw new Error('A file failed to upload. Please try again.');

  // 3. confirm
  const confirmRes = await fetch(`/api/custom-requests/${requestId}/confirm`, { method: 'POST' });
  const confirmJson = await confirmRes.json();
  if (!confirmRes.ok || !confirmJson.success) {
    throw new Error(confirmJson.error || 'Could not finalise request');
  }

  return { requestNumber: requestNumber as string };
}
