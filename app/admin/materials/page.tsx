"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { uploadToBucket, uploadToSiteImagesBucket } from "@/lib/upload-image";
import { useEffect, useState } from "react";

type MediaType = "video" | "image";

type CraftMedia = {
  id: string;
  title: string;
  caption: string | null;
  media_type: MediaType;
  video_url: string | null;
  image_url: string | null;
  display_order: number;
};

async function authHeaders() {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  };
}

export default function AdminMaterialsPage() {
  const [items, setItems] = useState<CraftMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  const [mediaType, setMediaType] = useState<MediaType>("video");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMediaType, setEditMediaType] = useState<MediaType>("video");
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  async function fetchItems() {
    setLoading(true);
    const res = await fetch("/api/admin/craft-videos");
    const data = await res.json();
    if (data.success) setItems(data.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
  }

  async function handleUpload() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!file) {
      setError(`Pick a${mediaType === "image" ? "n image" : " video"} file`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const url =
        mediaType === "video"
          ? await uploadToBucket(file, "site-videos", "craft")
          : await uploadToSiteImagesBucket(file, "craft");

      const headers = await authHeaders();
      const res = await fetch("/api/admin/craft-videos", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: title.trim(),
          caption: caption.trim() || null,
          media_type: mediaType,
          ...(mediaType === "video" ? { video_url: url } : { image_url: url }),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        return;
      }
      setItems((prev) => [...prev, data.data]);
      setTitle("");
      setCaption("");
      setFile(null);
      showSuccess(`${mediaType === "image" ? "Image" : "Video"} added`);
    } catch (e: any) {
      setError(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    const headers = await authHeaders();
    const res = await fetch(`/api/admin/craft-videos/${id}`, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    if (data.success) {
      setItems((prev) => prev.filter((v) => v.id !== id));
      setDeletingId(null);
      showSuccess("Deleted");
    } else {
      setError(data.error);
    }
  }

  function openEdit(v: CraftMedia) {
    setEditingId(v.id);
    setEditMediaType(v.media_type);
    setEditTitle(v.title);
    setEditCaption(v.caption ?? "");
    setEditFile(null);
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditFile(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editTitle.trim()) {
      setError("Title is required");
      return;
    }
    setSavingEdit(true);
    setError("");
    try {
      let urlPatch: Record<string, string> = {};
      if (editFile) {
        const url =
          editMediaType === "video"
            ? await uploadToBucket(editFile, "site-videos", "craft")
            : await uploadToSiteImagesBucket(editFile, "craft");
        urlPatch =
          editMediaType === "video" ? { video_url: url } : { image_url: url };
      }
      const headers = await authHeaders();
      const res = await fetch(`/api/admin/craft-videos/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title: editTitle.trim(),
          caption: editCaption.trim() || null,
          media_type: editMediaType,
          ...urlPatch,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        return;
      }
      setItems((prev) => prev.map((v) => (v.id === id ? data.data : v)));
      setEditingId(null);
      showSuccess("Updated");
    } catch (e: any) {
      setError(`Update failed: ${e.message}`);
    } finally {
      setSavingEdit(false);
    }
  }

  const acceptFor = (t: MediaType) =>
    t === "video"
      ? "video/mp4,video/webm,video/quicktime"
      : "image/jpeg,image/png,image/webp";

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-espresso mb-1">
          Materials Page Media
        </h2>
        <p className="text-sm text-umber">
          {items.length} items · shown in upload order on /materials
        </p>
      </div>

      {successMsg && (
        <div className="px-4 py-3 mb-4 bg-green-50 border border-green-200 text-sm text-green-700">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Upload form */}
      <div className="border border-(--hairline) bg-ivory p-6 mb-8 max-w-2xl">
        <p className="font-mono-label text-[11px] uppercase text-brass mb-4">
          Add Media
        </p>

        <div className="flex gap-2 mb-5">
          {(["video", "image"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setMediaType(t);
                setFile(null);
              }}
              className={`px-4 py-2 font-mono-label text-xs uppercase tracking-widest border transition-colors ${
                mediaType === t
                  ? "bg-espresso text-ivory border-espresso"
                  : "border-(--hairline) text-umber hover:border-espresso hover:text-espresso"
              }`}
            >
              {t === "video" ? "Video" : "Image"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hand-stitching the collar"
              className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
            />
          </div>
          <div>
            <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="Short line describing the process shown"
              className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle resize-none"
            />
          </div>
          <div>
            <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
              {mediaType === "video" ? "Video File *" : "Image File *"}
            </label>
            <input
              type="file"
              accept={acceptFor(mediaType)}
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
            {uploading
              ? "Uploading…"
              : `+ Add ${mediaType === "video" ? "Video" : "Image"}`}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="border border-(--hairline) bg-ivory max-w-2xl">
        <div className="grid grid-cols-[1fr_1fr_140px] px-4 py-3 bg-black/2 border-b border-(--hairline) gap-3">
          {["Title", "Preview", "Actions"].map((h) => (
            <p
              key={h}
              className="font-mono-label text-[0.65rem] uppercase tracking-wider text-umber"
            >
              {h}
            </p>
          ))}
        </div>
        {loading ? (
          <p className="p-6 text-sm text-umber">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-umber text-center">No media yet</p>
        ) : (
          items.map((v, i) => (
            <div
              key={v.id}
              className={`px-4 py-3 ${i < items.length - 1 ? "border-b border-(--hairline)" : ""}`}
            >
              {editingId === v.id ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {(["video", "image"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEditMediaType(t)}
                        className={`px-3 py-1.5 font-mono-label text-[0.65rem] uppercase tracking-widest border transition-colors ${
                          editMediaType === t
                            ? "bg-espresso text-ivory border-espresso"
                            : "border-(--hairline) text-umber"
                        }`}
                      >
                        {t === "video" ? "Video" : "Image"}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-(--hairline) bg-ivory px-3 py-2 text-sm text-espresso focus:outline-none focus:border-saddle"
                  />
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={2}
                    className="w-full border border-(--hairline) bg-ivory px-3 py-2 text-sm text-espresso focus:outline-none focus:border-saddle resize-none"
                  />
                  <div>
                    <label className="text-xs text-umber block mb-1">
                      Replace {editMediaType === "video" ? "video" : "image"}{" "}
                      (optional)
                    </label>
                    <input
                      type="file"
                      accept={acceptFor(editMediaType)}
                      onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                      className="text-sm text-umber"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveEdit(v.id)}
                      disabled={savingEdit}
                      className="bg-espresso text-ivory px-4 py-2 font-mono-label text-xs uppercase tracking-widest hover:bg-saddle transition-colors disabled:opacity-50"
                    >
                      {savingEdit ? "Saving…" : "Save"}
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
                    <p className="text-[0.65rem] font-mono-label uppercase tracking-wider text-brass mt-0.5">
                      {v.media_type}
                    </p>
                    {v.caption && (
                      <p className="text-xs text-umber truncate">{v.caption}</p>
                    )}
                  </div>
                  {v.media_type === "video" ? (
                    <video
                      src={v.video_url ?? undefined}
                      className="w-full h-14 object-cover bg-black/5"
                      muted
                    />
                  ) : (
                    <img
                      src={v.image_url ?? undefined}
                      alt={v.title}
                      className="w-full h-14 object-cover bg-black/5"
                    />
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(v)}
                      className="text-xs text-umber hover:text-saddle text-left"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(v.id)}
                      className="text-xs text-umber hover:text-red-600 text-left"
                    >
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
            <h3 className="font-display text-lg text-espresso mb-2">
              Delete this item?
            </h3>
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
