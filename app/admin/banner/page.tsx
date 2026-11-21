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
  const [desktopUrl, setDesktopUrl] = useState<string | null>(null);
  const [mobileUrl, setMobileUrl] = useState<string | null>(null);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/banner')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setDesktopUrl(data.data.image_url);
          setDesktopPreview(data.data.image_url);
          setMobileUrl(data.data.mobile_image_url ?? null);
          setMobilePreview(data.data.mobile_image_url ?? null);
        }
        setLoading(false);
      });
  }, []);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function handlePick(kind: 'desktop' | 'mobile', e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (kind === 'desktop') {
      setDesktopFile(f);
      setDesktopPreview(url);
    } else {
      setMobileFile(f);
      setMobilePreview(url);
    }
    setError('');
  }

  async function handleSave() {
    if (!desktopFile && !mobileFile) {
      setError('Pick an image first');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, string> = {};
      if (desktopFile) payload.image_url = await uploadToBucket(desktopFile, 'site-assets', 'banner');
      if (mobileFile) payload.mobile_image_url = await uploadToBucket(mobileFile, 'site-assets', 'banner');

      const headers = await authHeaders();
      const res = await fetch('/api/admin/banner', {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        return;
      }
      setDesktopUrl(data.data.image_url);
      setMobileUrl(data.data.mobile_image_url ?? null);
      setDesktopFile(null);
      setMobileFile(null);
      showSuccess('Banner updated');
    } catch (e: any) {
      setError(`Upload failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveMobile() {
    // Nothing saved yet: just drop the picked file
    if (!mobileUrl) {
      setMobileFile(null);
      setMobilePreview(null);
      return;
    }
    if (!confirm('Remove the mobile image? Phones will use the desktop image instead.')) return;

    setSaving(true);
    setError('');
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/admin/banner', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ mobile_image_url: null }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        return;
      }
      setMobileUrl(null);
      setMobileFile(null);
      setMobilePreview(null);
      showSuccess('Mobile image removed');
    } catch (e: any) {
      setError(`Failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-espresso mb-1">Homepage Banner</h2>
        <p className="text-sm text-umber">Upload a landscape image for desktop and a portrait image for phones.</p>
      </div>

      {successMsg && (
        <div className="px-4 py-3 mb-4 bg-green-50 border border-green-200 text-sm text-green-700">{successMsg}</div>
      )}
      {error && <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {loading ? (
        <p className="text-sm text-umber">Loading…</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-[1.6fr_1fr] max-w-4xl items-start mb-6">
            {/* Desktop */}
            <div className="border border-(--hairline) bg-ivory p-6">
              <p className="font-mono-label text-xs uppercase tracking-wider text-espresso mb-1">Desktop</p>
              <p className="text-xs text-umber mb-4">Landscape, around 2400 × 1350.</p>
              <div
                className="border border-dashed border-(--hairline) cursor-pointer aspect-video flex items-center justify-center overflow-hidden hover:border-saddle transition-colors"
                onClick={() => document.getElementById('banner-upload-desktop')?.click()}
              >
                {desktopPreview ? (
                  <img src={desktopPreview} alt="Desktop banner preview" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs text-umber p-4 text-center">Click to upload desktop image</p>
                )}
                <input
                  id="banner-upload-desktop"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => handlePick('desktop', e)}
                  className="hidden"
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="border border-(--hairline) bg-ivory p-6">
              <p className="font-mono-label text-xs uppercase tracking-wider text-espresso mb-1">Mobile</p>
              <p className="text-xs text-umber mb-4">Portrait, around 1080 × 1920. Optional.</p>
              <div
                className="border border-dashed border-(--hairline) cursor-pointer aspect-[9/16] w-full max-w-48 flex items-center justify-center overflow-hidden hover:border-saddle transition-colors"
                onClick={() => document.getElementById('banner-upload-mobile')?.click()}
              >
                {mobilePreview ? (
                  <img src={mobilePreview} alt="Mobile banner preview" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs text-umber p-4 text-center">Click to upload mobile image</p>
                )}
                <input
                  id="banner-upload-mobile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => handlePick('mobile', e)}
                  className="hidden"
                />
              </div>
              {mobilePreview && (
                <button
                  onClick={handleRemoveMobile}
                  disabled={saving}
                  className="mt-3 text-xs text-umber underline hover:text-red-600 disabled:opacity-50"
                >
                  Remove mobile image
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || (!desktopFile && !mobileFile)}
            className="bg-espresso text-ivory px-5 py-2.5 font-mono-label text-xs uppercase tracking-widest hover:bg-saddle transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Banner'}
          </button>
        </>
      )}
    </div>
  );
}
