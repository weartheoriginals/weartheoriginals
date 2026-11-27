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

const GENERIC_ERROR = 'Something went wrong. Please try again, or contact us on WhatsApp.';

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
  if (!res.ok || !json.success) throw new Error(json.error || GENERIC_ERROR);
  const { requestId, requestNumber, uploads } = json.data;

  // no files: the server already saved it as submitted
  if (files.length === 0) return { requestNumber: requestNumber as string };

  // 2. upload files directly to Supabase Storage
  const results = await Promise.all(
    uploads.map((u: { path: string; token: string }, i: number) =>
      supabase.storage.from('custom-request-files').uploadToSignedUrl(u.path, u.token, files[i]),
    ),
  );
  const failed = results.find(r => r.error);
  if (failed?.error) throw new Error('One of your files could not be uploaded. Please try again.');

  // 3. confirm
  const confirmRes = await fetch(`/api/custom-requests/${requestId}/confirm`, { method: 'POST' });
  const confirmJson = await confirmRes.json();
  if (!confirmRes.ok || !confirmJson.success) {
    throw new Error(GENERIC_ERROR);
  }

  return { requestNumber: requestNumber as string };
}
