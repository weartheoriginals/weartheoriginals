'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { uploadToBucket } from '@/lib/upload-image';
import { useEffect, useState } from 'react';

type CraftVideo = {
  id: string;
  title: string;
  caption: string | null;
  video_url: string;
  display_order: number;
};

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

export default function AdminMaterialsPage() {
  const [videos, setVideos] = useState<CraftVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  async function fetchVideos() {
    setLoading(true);
    const res = await fetch('/api/admin/craft-videos');
    const data = await res.json();
    if (data.success) setVideos(data.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError('');
  }

  async function handleUpload() {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!file) {
      setError('Pick a video file');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const video_url = await uploadToBucket(file, 'site-videos', 'craft');
      const headers = await authHeaders();
      const res = await fetch('/api/admin/craft-videos', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: title.trim(), caption: caption.trim() || null, video_url }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        return;
      }
      setVideos(prev => [...prev, data.data]);
      setTitle('');
      setCaption('');
      setFile(null);
      showSuccess('Video added');
    } catch (e: any) {
      setError(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    const headers = await authHeaders();
    const res = await fetch(`/api/admin/craft-videos/${id}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (data.success) {
      setVideos(prev => prev.filter(v => v.id !== id));
      setDeletingId(null);
      showSuccess('Video deleted');
    } else {
      setError(data.error);
    }
  }

  function openEdit(v: CraftVideo) {
    setEditingId(v.id);
    setEditTitle(v.title);
    setEditCaption(v.caption ?? '');
    setEditFile(null);
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditFile(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editTitle.trim()) {
      setError('Title is required');
      return;
    }
    setSavingEdit(true);
    setError('');
    try {
      let video_url: string | undefined;
      if (editFile) {
        video_url = await uploadToBucket(editFile, 'site-videos', 'craft');
      }
      const headers = await authHeaders();
      const res = await fetch(`/api/admin/craft-videos/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title: editTitle.trim(),
          caption: editCaption.trim() || null,
          ...(video_url ? { video_url } : {}),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        return;
      }
      setVideos(prev => prev.map(v => (v.id === id ? data.data : v)));
      setEditingId(null);
      showSuccess('Video updated');
    } catch (e: any) {
      setError(`Update failed: ${e.message}`);
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-espresso mb-1">Materials Page Videos</h2>
        <p className="text-sm text-umber">{videos.length} videos · shown in upload order on /materials</p>
      </div>

      {successMsg && (
        <div className="px-4 py-3 mb-4 bg-green-50 border border-green-200 text-sm text-green-700">{successMsg}</div>
      )}
      {error && <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {/* Upload form */}
      <div className="border border-(--hairline) bg-ivory p-6 mb-8 max-w-2xl">
        <p className="font-mono-label text-[11px] uppercase text-brass mb-4">Add Video</p>
        <div className="space-y-4">
          <div>
            <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Hand-stitching the collar"
              className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
            />
          </div>
          <div>
            <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">Caption</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={2}
              placeholder="Short line describing the process shown"
              className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle resize-none"
            />
          </div>
          <div>
            <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">Video File *</label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFilePick}
              className="text-sm text-umber"
            />
            {file && <p className="text-xs text-umber mt-2">{file.name}</p>}
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-espresso text-ivory px-5 py-2.5 font-mono-label text-xs uppercase tracking-widest hover:bg-saddle transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : '+ Add Video'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="border border-(--hairline) bg-ivory max-w-2xl">
        <div className="grid grid-cols-[1fr_1fr_80px] px-4 py-3 bg-black/2 border-b border-(--hairline) gap-3">
          {['Title', 'Preview', 'Actions'].map(h => (
            <p key={h} className="font-mono-label text-[0.65rem] uppercase tracking-wider text-umber">
              {h}
            </p>
          ))}
        </div>
        {loading ? (
          <p className="p-6 text-sm text-umber">Loading…</p>
        ) : videos.length === 0 ? (
          <p className="p-6 text-sm text-umber text-center">No videos yet</p>
        ) : (
          videos.map((v, i) => (
            <div key={v.id} className={`px-4 py-3 ${i < videos.length - 1 ? 'border-b border-(--hairline)' : ''}`}>
              {editingId === v.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full border border-(--hairline) bg-ivory px-3 py-2 text-sm text-espresso focus:outline-none focus:border-saddle"
                  />
                  <textarea
                    value={editCaption}
                    onChange={e => setEditCaption(e.target.value)}
                    rows={2}
                    className="w-full border border-(--hairline) bg-ivory px-3 py-2 text-sm text-espresso focus:outline-none focus:border-saddle resize-none"
                  />
                  <div>
                    <label className="text-xs text-umber block mb-1">Replace video (optional)</label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={e => setEditFile(e.target.files?.[0] ?? null)}
                      className="text-sm text-umber"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveEdit(v.id)}
                      disabled={savingEdit}
                      className="bg-espresso text-ivory px-4 py-2 font-mono-label text-xs uppercase tracking-widest hover:bg-saddle transition-colors disabled:opacity-50"
                    >
                      {savingEdit ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-(--hairline) text-xs font-mono-label uppercase tracking-widest text-umber"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-[1fr_1fr_140px] gap-3 items-center">
                  <div>
                    <p className="text-sm text-espresso">{v.title}</p>
                    {v.caption && <p className="text-xs text-umber truncate">{v.caption}</p>}
                  </div>
                  <video src={v.video_url} className="w-full h-14 object-cover bg-black/5" muted />
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(v)} className="text-xs text-umber hover:text-saddle text-left">
                      Edit
                    </button>
                    <button onClick={() => setDeletingId(v.id)} className="text-xs text-umber hover:text-red-600 text-left">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-ivory p-6 max-w-sm w-full text-center">
            <h3 className="font-display text-lg text-espresso mb-2">Delete this video?</h3>
            <p className="text-sm text-umber mb-4">This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingId(null)}
                className="px-5 py-2.5 border border-(--hairline) text-xs font-mono-label uppercase tracking-widest text-umber hover:border-espresso hover:text-espresso transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-5 py-2.5 bg-red-600 text-white text-xs font-mono-label uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
