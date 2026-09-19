'use client';

import { uploadToBucket } from '@/lib/upload-image';
import { useCallback, useEffect, useState } from 'react';

type Section = {
  id: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  button_label: string | null;
  button_href: string | null;
  display_order: number;
  is_visible: boolean;
};

type FormState = {
  eyebrow: string;
  title: string;
  description: string;
  button_label: string;
  button_href: string;
  is_visible: boolean;
  image_url: string | null; // current image (existing or freshly uploaded)
};

const EMPTY_FORM: FormState = {
  eyebrow: '',
  title: '',
  description: '',
  button_label: '',
  button_href: '',
  is_visible: true,
  image_url: null,
};

function toForm(s: Section): FormState {
  return {
    eyebrow: s.eyebrow ?? '',
    title: s.title,
    description: s.description ?? '',
    button_label: s.button_label ?? '',
    button_href: s.button_href ?? '',
    is_visible: s.is_visible,
    image_url: s.image_url,
  };
}

export default function HomeSectionsAdminPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/home-sections?all=true');
    if (res.ok) setSections(await res.json());
    else setError('Failed to load sections');
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setCreating(true);
    setError(null);
  }

  function startEdit(s: Section) {
    setCreating(false);
    setEditingId(s.id);
    setForm(toForm(s));
    setImageFile(null);
    setError(null);
  }

  function cancelForm() {
    setCreating(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setError(null);
  }

  async function handleSave() {
    setError(null);

    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    const hasLabel = !!form.button_label.trim();
    const hasHref = !!form.button_href.trim();
    if (hasLabel !== hasHref) {
      setError('Button needs both a label and a link (or leave both empty)');
      return;
    }

    setSaving(true);
    try {
      // Upload a new image first if one was picked
      let image_url = form.image_url;
      if (imageFile) {
        image_url = await uploadToBucket(imageFile, 'site-assets', 'home-sections');
      }

      const payload = {
        eyebrow: form.eyebrow,
        title: form.title,
        description: form.description,
        image_url,
        button_label: form.button_label,
        button_href: form.button_href,
        is_visible: form.is_visible,
      };

      const res = await fetch(editingId ? `/api/admin/home-sections/${editingId}` : '/api/admin/home-sections', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Save failed');
      }

      cancelForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this section?')) return;
    const res = await fetch(`/api/admin/home-sections/${id}`, { method: 'DELETE' });
    if (res.ok) await load();
    else setError('Delete failed');
  }

  async function handleToggleVisible(s: Section) {
    const res = await fetch(`/api/admin/home-sections/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: !s.is_visible }),
    });
    if (res.ok) await load();
    else setError('Failed to update visibility');
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next); // optimistic

    const res = await fetch('/api/admin/home-sections/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map(s => s.id) }),
    });
    if (!res.ok) {
      setError('Reorder failed');
      await load(); // roll back to server truth
    }
  }

  const showForm = creating || editingId !== null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Homepage Sections</h1>
        {!showForm && (
          <button onClick={startCreate} className="rounded bg-black px-4 py-2 text-white">
            Add section
          </button>
        )}
      </div>

      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {showForm && (
        <div className="mb-8 space-y-4 rounded border p-4">
          <h2 className="font-medium">{editingId ? 'Edit section' : 'New section'}</h2>

          <label className="block">
            <span className="text-sm">Eyebrow (small label, optional)</span>
            <input
              className="mt-1 w-full rounded border p-2"
              value={form.eyebrow}
              onChange={e => setForm({ ...form, eyebrow: e.target.value })}
            />
          </label>

          <label className="block">
            <span className="text-sm">Title *</span>
            <input
              className="mt-1 w-full rounded border p-2"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </label>

          <label className="block">
            <span className="text-sm">Description (optional)</span>
            <textarea
              rows={4}
              className="mt-1 w-full rounded border p-2"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </label>

          <div>
            <span className="text-sm">Image (optional)</span>
            {form.image_url && !imageFile && (
              <div className="mt-2 flex items-center gap-3">
                <img src={form.image_url} alt="" className="h-20 w-32 rounded object-cover" />
                <button
                  type="button"
                  className="text-sm text-red-600 underline"
                  onClick={() => setForm({ ...form, image_url: null })}
                >
                  Remove image
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="mt-2 block text-sm"
              onChange={e => setImageFile(e.target.files?.[0] ?? null)}
            />
            {imageFile && (
              <p className="mt-1 text-xs text-gray-500">New image selected: {imageFile.name} (uploads on save)</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm">Button label (optional)</span>
              <input
                className="mt-1 w-full rounded border p-2"
                placeholder="Explore Materials"
                value={form.button_label}
                onChange={e => setForm({ ...form, button_label: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm">Button link (optional)</span>
              <input
                className="mt-1 w-full rounded border p-2"
                placeholder="/materials"
                value={form.button_href}
                onChange={e => setForm({ ...form, button_href: e.target.value })}
              />
            </label>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_visible}
              onChange={e => setForm({ ...form, is_visible: e.target.checked })}
            />
            <span className="text-sm">Visible on homepage</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={cancelForm} disabled={saving} className="rounded border px-4 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : sections.length === 0 ? (
        <p className="text-gray-500">No sections yet. Add your first one.</p>
      ) : (
        <ul className="space-y-3">
          {sections.map((s, i) => (
            <li key={s.id} className={`flex items-center gap-4 rounded border p-3 ${s.is_visible ? '' : 'opacity-50'}`}>
              <div className="flex flex-col">
                <button
                  onClick={() => handleMove(i, -1)}
                  disabled={i === 0}
                  className="disabled:opacity-30"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleMove(i, 1)}
                  disabled={i === sections.length - 1}
                  className="disabled:opacity-30"
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>

              {s.image_url ? (
                <img src={s.image_url} alt="" className="h-16 w-24 rounded object-cover" />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                  No image
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.title}</p>
                <p className="truncate text-sm text-gray-500">
                  {s.eyebrow || '—'}
                  {s.button_label && ` · Button: ${s.button_label} → ${s.button_href}`}
                </p>
              </div>

              <div className="flex gap-3 text-sm">
                <button onClick={() => handleToggleVisible(s)} className="underline">
                  {s.is_visible ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => startEdit(s)} className="underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(s.id)} className="text-red-600 underline">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
