import { useEffect, useRef, useState } from 'react'
import api from '../api/client'
import { useTranslation } from 'react-i18next'

const emptyForm = {
  categoryId: '',
  nameEn: '',
  nameAr: '',
  descriptionEn: '',
  descriptionAr: '',
  price: '',
  imageUrl: '',
  isAvailable: true,
  sortOrder: 0
}

export default function AdminMenuItems() {
  const { t, i18n } = useTranslation()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const load = async () => {
    const [c, m] = await Promise.all([
      api.get('/api/menu/categories'),
      api.get('/api/menu/items')
    ])
    setCategories(c.data)
    setItems(m.data)
  }

  useEffect(() => { load() }, [])

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected))
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setFile(null)
    setPreviewUrl('')
    setEditingId(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      let imageUrl = form.imageUrl

      if (file) {
        const data = new FormData()
        data.append('file', file)
        const upload = await api.post('/api/admin/upload-image', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        imageUrl = upload.data.url
      }

      const payload = { ...form, price: Number(form.price), imageUrl }

      if (editingId) {
        await api.put(`/api/admin/menu-items/${editingId}`, payload)
      } else {
        await api.post('/api/admin/menu-items', payload)
      }

      resetForm()
      await load()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setPreviewUrl(item.imageUrl || '')
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
    setForm({
      categoryId: item.categoryId,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      descriptionEn: item.descriptionEn,
      descriptionAr: item.descriptionAr,
      price: item.price,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      sortOrder: item.sortOrder
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const del = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/api/admin/menu-items/${id}`)
      await load()
    } catch (err) {
      alert(err.message || 'Failed to delete item.')
    }
  }

  const displayName = (item) =>
    i18n.language === 'ar' ? item.nameAr : item.nameEn

  return (
    <div className="admin-grid">
      {/* ── Form Panel ── */}
      <form className="panel form-panel" onSubmit={submit}>
        <h3>{editingId ? t('editItem') : t('addItem')}</h3>

        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          required
        >
          <option value="">-- {t('category')} --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {i18n.language === 'ar' ? c.nameAr : c.nameEn}
            </option>
          ))}
        </select>

        <input
          placeholder={t('nameEn')}
          value={form.nameEn}
          onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          required
        />
        <input
          placeholder={t('nameAr')}
          value={form.nameAr}
          onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
          required
        />
        <textarea
          placeholder={t('descriptionEn')}
          value={form.descriptionEn}
          onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
          required
        />
        <textarea
          placeholder={t('descriptionAr')}
          value={form.descriptionAr}
          onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder={t('price')}
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        {/* Image URL fallback */}
        <input
          placeholder={t('image') + ' URL (optional)'}
          value={form.imageUrl}
          onChange={(e) => {
            setForm({ ...form, imageUrl: e.target.value })
            if (e.target.value) setPreviewUrl(e.target.value)
          }}
        />

        {/* File upload */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Image preview */}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: 180,
              objectFit: 'cover',
              borderRadius: 8,
              marginTop: 4
            }}
            onError={() => setPreviewUrl('')}
          />
        )}

        <input
          type="number"
          placeholder={t('sortOrder') || 'Sort order'}
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
        />

        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
          />
          {t('available')}
        </label>

        {error && <p className="error">{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="primary-btn" disabled={saving}>
            {saving ? t('loading') : t('save')}
          </button>
          {editingId && (
            <button
              type="button"
              className="ghost-btn"
              onClick={resetForm}
            >
              {t('cancel') || 'Cancel'}
            </button>
          )}
        </div>
      </form>

      {/* ── Items List Panel ── */}
      <div className="panel">
        <h3>{t('manageMenu')}</h3>

        {items.length === 0 ? (
          <p className="muted" style={{ padding: '2rem 0', textAlign: 'center' }}>
            No menu items yet. Add one using the form.
          </p>
        ) : (
          <div className="admin-table">
            {items.map((item) => (
              <div key={item.id} className="admin-row">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.nameEn}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: 'var(--surface)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20
                    }}
                  >
                    🍽️
                  </div>
                )}

                <div className="grow">
                  <strong>{displayName(item)}</strong>
                  <p>
                    {Number(item.price).toFixed(2)} EGP
                    {!item.isAvailable && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          color: 'var(--danger, #e53)',
                          fontWeight: 600
                        }}
                      >
                        {t('unavailable') || 'Unavailable'}
                      </span>
                    )}
                  </p>
                </div>

                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() => startEdit(item)}
                >
                  {t('edit')}
                </button>
                <button
                  className="ghost-btn danger"
                  type="button"
                  onClick={() => del(item.id, displayName(item))}
                >
                  {t('delete')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}