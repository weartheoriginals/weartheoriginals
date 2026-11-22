'use client';

import { uploadToBucket } from '@/lib/upload-image';
import { useCallback, useEffect, useState } from 'react';

type LookbookImage = {
  id: string;
  image_url: string;
  display_order: number;
};

export default function LookbookAdminPage() {
  const [images, setImages] = useState<LookbookImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/lookbook');
    if (res.ok) setImages(await res.json());
    else setError('Failed to load images');
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload() {
    if (files.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading ${i + 1} of ${files.length}…`);
        urls.push(await uploadToBucket(files[i], 'site-assets', 'lookbook'));
      }

      setProgress('Saving…');
      const res = await fetch('/api/admin/lookbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_urls: urls }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Save failed');
      }

      setFiles([]);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress('');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this image?')) return;
    const res = await fetch(`/api/admin/lookbook/${id}`, { method: 'DELETE' });
    if (res.ok) await load();
    else setError('Delete failed');
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);

    const res = await fetch('/api/admin/lookbook/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map(img => img.id) }),
    });
    if (!res.ok) {
      setError('Reorder failed');
      await load();
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold">Lookbook</h1>

      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mb-8 space-y-3 rounded border p-4">
        <span className="text-sm">Add images (you can pick several at once)</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="block text-sm"
          onChange={e => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 && <p className="text-xs text-gray-500">{files.length} selected</p>}
        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {uploading ? progress || 'Uploading…' : 'Upload'}
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : images.length === 0 ? (
        <p className="text-gray-500">No images yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.id} className="rounded border p-2">
              <img src={img.image_url} alt="" className="aspect-video w-full rounded object-cover" />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">#{i + 1}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleMove(i, -1)}
                    disabled={i === 0}
                    className="disabled:opacity-30"
                    aria-label="Move earlier"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => handleMove(i, 1)}
                    disabled={i === images.length - 1}
                    className="disabled:opacity-30"
                    aria-label="Move later"
                  >
                    ▶
                  </button>
                  <button onClick={() => handleDelete(img.id)} className="text-red-600 underline">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
