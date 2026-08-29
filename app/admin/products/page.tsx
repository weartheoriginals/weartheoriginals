'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Category, ProductImage, ProductVariantWithImage, ProductWithDetails } from '@/lib/types';
import { uploadToProductImagesBucket } from '@/lib/upload-image';
import { useEffect, useState } from 'react';

type ModalMode = 'add' | 'edit' | null;
type Tab = 'details' | 'images' | 'variants';

const emptyDetails = {
  name: '',
  category_id: '',
  price: '',
  description: '',
  is_featured: false,
  is_active: true,
  brand_name: '',
  materials: '',
  features: '',
  processing_days_min: '',
  processing_days_max: '',
  return_policy: '',
  shipping_from: '',
  free_delivery: true,
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);

  const [details, setDetails] = useState(emptyDetails);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariantWithImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [variantForm, setVariantForm] = useState({ attribute_name: '', attribute_value: '', stock_quantity: '0' });
  const [savingVariant, setSavingVariant] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  async function fetchProducts() {
    setLoading(true);
    const headers = await authHeaders();
    const res = await fetch('/api/admin/products?limit=50', { headers });
    const data = await res.json();
    if (data.success) setProducts(data.data.data);
    setLoading(false);
  }

  async function fetchCategories() {
    const headers = await authHeaders();
    const res = await fetch('/api/admin/categories', { headers });
    const data = await res.json();
    if (data.success) setCategories(data.data);
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function detailsFromProduct(p: ProductWithDetails) {
    return {
      name: p.name,
      category_id: p.category_id ?? '',
      price: String(p.price),
      description: p.description ?? '',
      is_featured: p.is_featured,
      is_active: p.is_active,
      brand_name: p.brand_name ?? '',
      materials: p.materials ?? '',
      features: (p.features ?? []).join('\n'),
      processing_days_min: p.processing_days_min !== null ? String(p.processing_days_min) : '',
      processing_days_max: p.processing_days_max !== null ? String(p.processing_days_max) : '',
      return_policy: p.return_policy ?? '',
      shipping_from: p.shipping_from ?? '',
      free_delivery: p.free_delivery,
    };
  }

  function openAdd() {
    setDetails(emptyDetails);
    setEditingProduct(null);
    setImages([]);
    setVariants([]);
    setError('');
    setActiveTab('details');
    setModalMode('add');
  }

  function openEdit(p: ProductWithDetails) {
    setDetails(detailsFromProduct(p));
    setEditingProduct(p);
    setImages(p.images ?? []);
    setVariants((p.variants as ProductVariantWithImage[]) ?? []);
    setError('');
    setActiveTab('details');
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingProduct(null);
    setError('');
  }

  function buildPayload() {
    return {
      name: details.name.trim(),
      category_id: details.category_id || null,
      price: details.price,
      description: details.description.trim() || null,
      is_featured: details.is_featured,
      is_active: details.is_active,
      brand_name: details.brand_name.trim() || null,
      materials: details.materials.trim() || null,
      features: details.features
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean),
      processing_days_min: details.processing_days_min === '' ? null : details.processing_days_min,
      processing_days_max: details.processing_days_max === '' ? null : details.processing_days_max,
      return_policy: details.return_policy.trim() || null,
      shipping_from: details.shipping_from.trim() || null,
      free_delivery: details.free_delivery,
    };
  }

  async function handleSaveDetails() {
    setSaving(true);
    setError('');

    if (!details.name.trim()) {
      setError('Name is required');
      setSaving(false);
      return;
    }
    if (!details.category_id) {
      setError('Category is required');
      setSaving(false);
      return;
    }
    if (details.price === '' || isNaN(parseFloat(details.price))) {
      setError('A valid price is required');
      setSaving(false);
      return;
    }

    const headers = await authHeaders();
    const payload = buildPayload();

    if (editingProduct) {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSaving(false);
      if (!data.success) {
        setError(data.error);
        return;
      }
      setEditingProduct(data.data);
      fetchProducts();
      showSuccess('Product updated');
    } else {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSaving(false);
      if (!data.success) {
        setError(data.error);
        return;
      }
      // Product now exists — switch into edit mode so Images/Variants tabs unlock
      setEditingProduct({ ...data.data, category: null, images: [], variants: [] });
      setModalMode('edit');
      fetchProducts();
      showSuccess('Product added — now add images and variants');
    }
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    setUploadingImage(true);
    setError('');
    try {
      const image_url = await uploadToProductImagesBucket(file, 'products');
      const headers = await authHeaders();
      const res = await fetch(`/api/admin/products/${editingProduct.id}/images`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ image_url, is_primary: images.length === 0 }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      } else {
        setImages(prev => [...prev, data.data]);
      }
    } catch (e: any) {
      setError(`Image upload failed: ${e.message}`);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  async function handleSetPrimary(imageId: string) {
    if (!editingProduct) return;
    setError('');
    const headers = await authHeaders();
    const res = await fetch(`/api/admin/products/${editingProduct.id}/images?image_id=${imageId}`, {
      method: 'PUT',
      headers,
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.error);
      return;
    }
    setImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })));
  }

  async function handleDeleteImage(imageId: string) {
    if (!editingProduct) return;
    const headers = await authHeaders();
    const res = await fetch(`/api/admin/products/${editingProduct.id}/images?image_id=${imageId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (data.success) {
      setImages(prev => prev.filter(img => img.id !== imageId));
    } else {
      setError(data.error);
    }
  }

  async function handleAddVariant() {
    if (!editingProduct) return;
    if (!variantForm.attribute_name.trim() || !variantForm.attribute_value.trim()) {
      setError('Attribute name and value are required');
      return;
    }
    setSavingVariant(true);
    setError('');
    const headers = await authHeaders();
    const res = await fetch(`/api/admin/products/${editingProduct.id}/variants`, {
      method: 'POST',
      headers,
      body: JSON.stringify(variantForm),
    });
    const data = await res.json();
    setSavingVariant(false);
    if (!data.success) {
      setError(data.error);
      return;
    }
    setVariants(prev => [...prev, data.data]);
    setVariantForm({ attribute_name: variantForm.attribute_name, attribute_value: '', stock_quantity: '0' });
  }

  async function handleDeleteVariant(variantId: string) {
    if (!editingProduct) return;
    const headers = await authHeaders();
    const res = await fetch(`/api/admin/products/${editingProduct.id}/variants?variant_id=${variantId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (data.success) {
      setVariants(prev => prev.filter(v => v.id !== variantId));
    } else {
      setError(data.error);
    }
  }

  async function handleDelete(id: string) {
    setDeleteError('');
    const headers = await authHeaders();
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (!data.success) {
      setDeleteError(data.error);
      return;
    }
    setDeletingId(null);
    fetchProducts();
    showSuccess('Product deleted');
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'images', label: 'Images' },
    { id: 'variants', label: 'Variants' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl text-espresso mb-1">Products</h2>
          <p className="text-sm text-umber">{products.length} total</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-espresso text-ivory px-5 py-2.5 font-mono-label text-xs uppercase tracking-widest hover:bg-saddle transition-colors"
        >
          + Add Product
        </button>
      </div>

      {successMsg && (
        <div className="px-4 py-3 mb-4 bg-green-50 border border-green-200 text-sm text-green-700">{successMsg}</div>
      )}

      <div className="border border-(--hairline) bg-ivory">
        <div className="grid grid-cols-[56px_1fr_1fr_100px_80px_140px] px-4 py-3 bg-black/2 border-b border-(--hairline) gap-3 items-center">
          {['Image', 'Name', 'Category', 'Price', 'Status', 'Actions'].map(h => (
            <p key={h} className="font-mono-label text-[0.65rem] uppercase tracking-wider text-umber">
              {h}
            </p>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-sm text-umber">Loading…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-umber mb-4">No products yet</p>
            <button
              onClick={openAdd}
              className="bg-espresso text-ivory px-5 py-2.5 font-mono-label text-xs uppercase tracking-widest hover:bg-saddle transition-colors"
            >
              Add First Product
            </button>
          </div>
        ) : (
          products.map((p, i) => {
            const primaryImage = p.images?.find(img => img.is_primary) ?? p.images?.[0];
            return (
              <div
                key={p.id}
                className={`grid grid-cols-[56px_1fr_1fr_100px_80px_140px] px-4 py-3 gap-3 items-center ${
                  i < products.length - 1 ? 'border-b border-(--hairline)' : ''
                }`}
              >
                <div className="w-10 h-10 bg-black/3 border border-(--hairline) overflow-hidden flex items-center justify-center">
                  {primaryImage ? (
                    <img src={primaryImage.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-umber text-xs">—</span>
                  )}
                </div>
                <p className="text-sm text-espresso truncate">{p.name}</p>
                <p className="text-sm text-umber truncate">{p.category?.name ?? '—'}</p>
                <p className="text-xs text-umber font-mono-label truncate">{formatPrice(p.price)}</p>
                <p className={`text-xs font-mono-label uppercase ${p.is_active ? 'text-green-700' : 'text-umber/50'}`}>
                  {p.is_active ? 'Active' : 'Hidden'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="px-2 py-1 border border-(--hairline) text-xs text-umber hover:border-saddle hover:text-saddle transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(p.id);
                      setDeleteError('');
                    }}
                    className="px-2 py-1 border border-(--hairline) text-xs text-umber hover:border-red-500 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit modal */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-ivory w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-(--hairline) flex justify-between items-center">
              <h3 className="font-display text-lg text-espresso">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={closeModal} className="text-umber hover:text-espresso">
                ✕
              </button>
            </div>

            <div className="px-6 pt-4 flex gap-6 border-b border-(--hairline)">
              {TABS.map(tab => {
                const locked = tab.id !== 'details' && !editingProduct;
                return (
                  <button
                    key={tab.id}
                    disabled={locked}
                    onClick={() => !locked && setActiveTab(tab.id)}
                    className={`pb-3 font-mono-label text-xs uppercase tracking-widest border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-brass text-espresso'
                        : locked
                          ? 'border-transparent text-umber/30 cursor-not-allowed'
                          : 'border-transparent text-umber hover:text-espresso'
                    }`}
                  >
                    {tab.label}
                    {locked && ' (save details first)'}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {error && <div className="px-3 py-2 mb-4 bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={details.name}
                        onChange={e => setDetails(d => ({ ...d, name: e.target.value }))}
                        placeholder="e.g. Moto Jacket"
                        className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
                      />
                    </div>
                    <div>
                      <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                        Category *
                      </label>
                      <select
                        value={details.category_id}
                        onChange={e => setDetails(d => ({ ...d, category_id: e.target.value }))}
                        className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
                      >
                        <option value="">Select a category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={details.price}
                      onChange={e => setDetails(d => ({ ...d, price: e.target.value }))}
                      placeholder="e.g. 480"
                      className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
                    />
                  </div>

                  <div>
                    <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                      Description
                    </label>
                    <textarea
                      value={details.description}
                      onChange={e => setDetails(d => ({ ...d, description: e.target.value }))}
                      rows={3}
                      className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle resize-none"
                    />
                  </div>

                  <div className="flex gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={details.is_featured}
                        onChange={e => setDetails(d => ({ ...d, is_featured: e.target.checked }))}
                        className="accent-saddle"
                      />
                      <span className="font-mono-label text-xs uppercase tracking-wider text-umber">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={details.is_active}
                        onChange={e => setDetails(d => ({ ...d, is_active: e.target.checked }))}
                        className="accent-saddle"
                      />
                      <span className="font-mono-label text-xs uppercase tracking-wider text-umber">Active</span>
                    </label>
                  </div>

                  <hr className="border-(--hairline)" />
                  <p className="font-mono-label text-[11px] uppercase text-brass">Listing Details</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        value={details.brand_name}
                        onChange={e => setDetails(d => ({ ...d, brand_name: e.target.value }))}
                        className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
                      />
                    </div>
                    <div>
                      <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                        Materials
                      </label>
                      <input
                        type="text"
                        value={details.materials}
                        onChange={e => setDetails(d => ({ ...d, materials: e.target.value }))}
                        placeholder="e.g. Full-grain leather"
                        className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                      Features (one per line)
                    </label>
                    <textarea
                      value={details.features}
                      onChange={e => setDetails(d => ({ ...d, features: e.target.value }))}
                      rows={4}
                      placeholder={'Hand-stitched seams\nBrass hardware\nYKK zippers'}
                      className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                        Processing Days (min)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={details.processing_days_min}
                        onChange={e => setDetails(d => ({ ...d, processing_days_min: e.target.value }))}
                        className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
                      />
                    </div>
                    <div>
                      <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                        Processing Days (max)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={details.processing_days_max}
                        onChange={e => setDetails(d => ({ ...d, processing_days_max: e.target.value }))}
                        className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                      Return Policy
                    </label>
                    <textarea
                      value={details.return_policy}
                      onChange={e => setDetails(d => ({ ...d, return_policy: e.target.value }))}
                      rows={2}
                      className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="font-mono-label block text-xs uppercase tracking-wider text-umber mb-2">
                        Shipping From
                      </label>
                      <input
                        type="text"
                        value={details.shipping_from}
                        onChange={e => setDetails(d => ({ ...d, shipping_from: e.target.value }))}
                        placeholder="e.g. Karachi, Pakistan"
                        className="w-full border border-(--hairline) bg-ivory px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-saddle"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                      <input
                        type="checkbox"
                        checked={details.free_delivery}
                        onChange={e => setDetails(d => ({ ...d, free_delivery: e.target.checked }))}
                        className="accent-saddle"
                      />
                      <span className="font-mono-label text-xs uppercase tracking-wider text-umber">Free Delivery</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'images' && editingProduct && (
                <div>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {images.map(img => (
                      <div key={img.id} className="relative aspect-square border border-(--hairline) overflow-hidden group">
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                        {img.is_primary && (
                          <span className="absolute top-1 left-1 bg-espresso text-ivory text-[10px] font-mono-label uppercase px-1.5 py-0.5">
                            Primary
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                          {!img.is_primary && (
                            <button onClick={() => handleSetPrimary(img.id)} className="hover:underline">
                              Set as Primary
                            </button>
                          )}
                          <button onClick={() => handleDeleteImage(img.id)} className="hover:underline">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    <label
                      className={`aspect-square border border-dashed border-(--hairline) flex items-center justify-center cursor-pointer hover:border-saddle transition-colors ${
                        uploadingImage ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <span className="text-xs text-umber text-center px-2">
                        {uploadingImage ? 'Uploading…' : '+ Add Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImagePick}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-umber/70">
                    The first image uploaded is set as primary. Hover an image to set it as primary or delete it.
                  </p>
                </div>
              )}

              {activeTab === 'variants' && editingProduct && (
                <div>
                  <div className="border border-(--hairline) mb-5">
                    <div className="grid grid-cols-[1fr_1fr_80px_60px] px-3 py-2 bg-black/2 border-b border-(--hairline) gap-3">
                      {['Attribute', 'Value', 'Stock', ''].map(h => (
                        <p key={h} className="font-mono-label text-[0.65rem] uppercase tracking-wider text-umber">
                          {h}
                        </p>
                      ))}
                    </div>
                    {variants.length === 0 ? (
                      <p className="text-sm text-umber p-4 text-center">No variants yet</p>
                    ) : (
                      variants.map((v, i) => (
                        <div
                          key={v.id}
                          className={`grid grid-cols-[1fr_1fr_80px_60px] px-3 py-2 gap-3 items-center ${
                            i < variants.length - 1 ? 'border-b border-(--hairline)' : ''
                          }`}
                        >
                          <p className="text-sm text-espresso">{v.attribute_name}</p>
                          <p className="text-sm text-umber">{v.attribute_value}</p>
                          <p className="text-sm text-umber">{v.stock_quantity}</p>
                          <button
                            onClick={() => handleDeleteVariant(v.id)}
                            className="text-xs text-umber hover:text-red-600 text-left"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <p className="font-mono-label text-[11px] uppercase text-brass mb-3">Add Variant</p>
                  <div className="grid grid-cols-[1fr_1fr_100px] gap-3 items-end">
                    <div>
                      <label className="font-mono-label block text-[11px] uppercase tracking-wider text-umber mb-1.5">
                        Attribute
                      </label>
                      <input
                        type="text"
                        value={variantForm.attribute_name}
                        onChange={e => setVariantForm(f => ({ ...f, attribute_name: e.target.value }))}
                        placeholder="e.g. Size"
                        className="w-full border border-(--hairline) bg-ivory px-3 py-2 text-sm text-espresso focus:outline-none focus:border-saddle"
                      />
                    </div>
                    <div>
                      <label className="font-mono-label block text-[11px] uppercase tracking-wider text-umber mb-1.5">
                        Value
                      </label>
                      <input
                        type="text"
                        value={variantForm.attribute_value}
                        onChange={e => setVariantForm(f => ({ ...f, attribute_value: e.target.value }))}
                        placeholder="e.g. M"
                        className="w-full border border-(--hairline) bg-ivory px-3 py-2 text-sm text-espresso focus:outline-none focus:border-saddle"
                      />
                    </div>
                    <div>
                      <label className="font-mono-label block text-[11px] uppercase tracking-wider text-umber mb-1.5">
                        Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variantForm.stock_quantity}
                        onChange={e => setVariantForm(f => ({ ...f, stock_quantity: e.target.value }))}
                        className="w-full border border-(--hairline) bg-ivory px-3 py-2 text-sm text-espresso focus:outline-none focus:border-saddle"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddVariant}
                    disabled={savingVariant}
                    className="mt-3 bg-espresso text-ivory px-4 py-2 font-mono-label text-xs uppercase tracking-widest hover:bg-saddle transition-colors disabled:opacity-50"
                  >
                    {savingVariant ? 'Adding…' : '+ Add Variant'}
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-(--hairline) flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-(--hairline) text-xs font-mono-label uppercase tracking-widest text-umber hover:border-espresso hover:text-espresso transition-colors"
              >
                {activeTab === 'details' ? 'Cancel' : 'Done'}
              </button>
              {activeTab === 'details' && (
                <button
                  onClick={handleSaveDetails}
                  disabled={saving}
                  className="px-5 py-2.5 bg-espresso text-ivory text-xs font-mono-label uppercase tracking-widest hover:bg-saddle transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editingProduct ? 'Save Changes' : 'Save & Continue'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-ivory p-6 max-w-sm w-full text-center">
            <h3 className="font-display text-lg text-espresso mb-2">Delete product?</h3>
            <p className="text-sm text-umber mb-4">This will also remove its images and variants. This cannot be undone.</p>
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
