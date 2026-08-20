'use client';

import { supabaseClient } from '@/lib/supabase';
import { uploadToProductImagesBucket } from '@/lib/upload-image';
import type { CategoryWithParent } from '@/lib/types';
import { useEffect, useState } from 'react';

type ModalMode = 'add' | 'edit' | null;

const emptyForm = { name: '', slug: '', parent_id: '', image_url: '' };

async function authHeaders() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token}`,
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithParent[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingCat, setEditingCat] = useState<CategoryWithParent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  async function fetchCategories() {
    setLoading(true);
    const headers = await authHeaders();
    const res = await fetch('/api/admin/categories', { headers });
    const data = await res.json();
    if (data.success) setCategories(data.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function toSlug(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function openAdd() {
    setForm(emptyForm);
    setEditingCat(null);
    setError('');
    setImageFile(null);
    setImagePreview(null);
    setModalMode('add');
  }

  function openEdit(cat: CategoryWithParent) {
    setForm({ name: cat.name, slug: cat.slug, parent_id: cat.parent_id ?? '', image_url: cat.image_url ?? '' });
    setEditingCat(cat);
    setError('');
    setImageFile(null);
    setImagePreview(cat.image_url ?? null);
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingCat(null);
    setError('');
  }

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, slug: editingCat ? f.slug : toSlug(name) }));
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    if (!form.name.trim()) {
      setError('Name is required');
      setSaving(false);
      return;
    }

    let image_url = form.image_url || null;
    if (imageFile) {
      setUploading(true);
      try {
        image_url = await uploadToProductImagesBucket(imageFile, 'categories');
      } catch (e: any) {
        setError(`Image upload failed: ${e.message}`);
        setSaving(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      parent_id: form.parent_id || null,
      image_url,
    };

    const headers = await authHeaders();
    const url = editingCat ? `/api/admin/categories/${editingCat.id}` : '/api/admin/categories';
    const res = await fetch(url, {
      method: editingCat ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!data.success) {
      setError(data.error);
      setSaving(false);
      return;
    }

    setModalMode(null);
    setSaving(false);
    fetchCategories();
    showSuccess(editingCat ? 'Category updated' : 'Category added');
  }

  async function handleDelete(id: string) {
    setDeleteError('');
    const headers = await authHeaders();
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (!data.success) {
      setDeleteError(data.error);
      return;
    }
    setDeletingId(null);
    fetchCategories();
    showSuccess('Category deleted');
  }

  // Top-level categories can be a parent; exclude the category being edited from its own parent options
  const parentOptions = categories.filter(c => c.id !== editingCat?.id && !c.parent_id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl text-espresso mb-1">Categories</h2>
          <p className="text-sm text-umber">{categories.length} total</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-espresso text-ivory px-5 py-2.5 font-mono-label text-xs uppercase tracking-widest hover:bg-saddle transition-colors"
        >
          + Add Category
        </button>
      </div>

      {successMsg && (
        <div className="px-4 py-3 mb-4 bg-green-50 border border-green-200 text-sm text-green-700">{successMsg}</div>
      )}

      <div className="border border-(--hairline) bg-ivory">
        <div className="grid grid-cols-[56px_1fr_1fr_100px_140px] px-4 py-3 bg-black/2 border-b border-(--hairline) gap-3 items-center">
          {['Image', 'Name', 'Parent', 'Slug', 'Actions'].map(h => (
            <p key={h} className="font-mono-label text-[0.65rem] uppercase tracking-wider text-umber">
              {h}
            </p>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-sm text-umber">Loading…</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-umber mb-4">No categories yet</p>
            <button
              onClick={openAdd}
              className="bg-espresso text-ivory px-5 py-2.5 font-mono-label text-xs uppercase tracking-widest hover:bg-saddle transition-colors"
            >
              Add First Category
            </button>
          </div>
        ) : (
          categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`grid grid-cols-[56px_1fr_1fr_100px_140px] px-4 py-3 gap-3 items-center ${
                i < categories.length - 1 ? 'border-b border-(--hairline)' : ''
              }`}
            >
              <div className="w-10 h-10 bg-black/3 border border-(--hairline) overflow-hidden flex items-center justify-center">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-umber text-xs">—</span>
                )}
              </div>
              <p className="text-sm text-espresso truncate">{cat.name}</p>
              <p className="text-sm text-umber truncate">{cat.parent?.name ?? '—'}</p>
              <p className="text-xs text-umber font-mono-label truncate">{cat.slug}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="px-2 py-1 border border-(--hairline) text-xs text-umber hover:border-saddle hover:text-saddle transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeletingId(cat.id);
                    setDeleteError('');
                  }}
                  className="px-2 py-1 border border-(--hairline) text-xs text-umber hover:border-red-500 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit modal */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-ivory w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-(--hairline) flex justify-between items-center">
              <h3 className="font-display text-lg text-espresso">{editingCat ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={closeModal} className="text-umber hover:text-espresso">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

              <div>
                <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Jackets"
                  className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
                />
              </div>

              <div>
                <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="e.g. jackets"
                  className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
                />
                <p className="text-xs text-umber mt-1">/c/{form.slug || 'your-slug'}</p>
              </div>

              <div>
                <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                  Parent category
                </label>
                <select
                  value={form.parent_id}
                  onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
                  className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
                >
                  <option value="">None (top-level)</option>
                  {parentOptions.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">Image</label>
                <div
                  className="border border-dashed border-(--hairline) cursor-pointer min-h-25 flex items-center justify-center overflow-hidden hover:border-saddle transition-colors"
                  onClick={() => document.getElementById('cat-image-upload')?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-25 object-cover" />
                  ) : (
                    <p className="text-xs text-umber p-4 text-center">Click to upload category image</p>
                  )}
                  <input
                    id="cat-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImagePick}
                    className="hidden"
                  />
                </div>
                {imagePreview && (
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setForm(f => ({ ...f, image_url: '' }));
                    }}
                    className="text-xs text-red-600 mt-2"
                  >
                    ✕ Remove image
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-(--hairline) flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-(--hairline) text-xs font-mono-label uppercase tracking-widest text-umber hover:border-espresso hover:text-espresso transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="px-5 py-2.5 bg-espresso text-ivory text-xs font-mono-label uppercase tracking-widest hover:bg-saddle transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : saving ? 'Saving…' : editingCat ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-ivory p-6 max-w-sm w-full text-center">
            <h3 className="font-display text-lg text-espresso mb-2">Delete category?</h3>
            <p className="text-sm text-umber mb-4">
              Products in this category will become uncategorized. This cannot be undone.
            </p>
            {deleteError && (
              <div className="px-3 py-2 mb-4 bg-red-50 border border-red-200 text-sm text-red-700">{deleteError}</div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setDeletingId(null);
                  setDeleteError('');
                }}
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
