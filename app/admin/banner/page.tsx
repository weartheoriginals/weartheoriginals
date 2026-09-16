'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { uploadToBucket } from '@/lib/upload-image';
import { useEffect, useState } from 'react';

async function authHeaders() {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token}`,
  };
}

export default function AdminBannerPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/banner')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setImageUrl(data.data.image_url);
          setPreview(data.data.image_url);
        }
        setLoading(false);
      });
  }, []);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  }

  async function handleSave() {
    if (!file) {
      setError('Pick an image first');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const uploadedUrl = await uploadToBucket(file, 'site-assets', 'banner');
      const headers = await authHeaders();
      const res = await fetch('/api/admin/banner', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ image_url: uploadedUrl }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        return;
      }
      setImageUrl(data.data.image_url);
      setFile(null);
      setSuccessMsg('Banner updated');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setError(`Upload failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-espresso mb-1">Homepage Banner</h2>
        <p className="text-sm text-umber">Update the hero image shown on the homepage.</p>
      </div>

      {successMsg && (
        <div className="px-4 py-3 mb-4 bg-green-50 border border-green-200 text-sm text-green-700">{successMsg}</div>
      )}
      {error && <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      <div className="border border-(--hairline) bg-ivory p-6 max-w-2xl">
        {loading ? (
          <p className="text-sm text-umber">Loading…</p>
        ) : (
          <>
            <div
              className="border border-dashed border-(--hairline) cursor-pointer aspect-video flex items-center justify-center overflow-hidden hover:border-saddle transition-colors mb-4"
              onClick={() => document.getElementById('banner-upload')?.click()}
            >
              {preview ? (
                <img src={preview} alt="Banner preview" className="w-full h-full object-cover" />
              ) : (
                <p className="text-xs text-umber p-4 text-center">Click to upload banner image</p>
              )}
              <input
                id="banner-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePick}
                className="hidden"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !file}
              className="bg-espresso text-ivory px-5 py-2.5 font-mono-label text-xs uppercase tracking-widest hover:bg-saddle transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Banner'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
