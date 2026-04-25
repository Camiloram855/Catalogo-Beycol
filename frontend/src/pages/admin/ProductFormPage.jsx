import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { ArrowLeft, Upload, X, Star } from 'lucide-react'
import { useCategories } from '../../hooks/useCatalog'
import { Spinner } from '../../components/shared/UI'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { resolveMediaUrl } from '../../utils/media'

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: categoriesData } = useCategories()
  const categories = categoriesData?.data || []

  const [loading,    setLoading]    = useState(false)
  const [fetching,   setFetching]   = useState(isEdit)
  const [images,     setImages]     = useState([])       // File[] new
  const [existing,   setExisting]   = useState([])       // existing images
  const [primaryIdx, setPrimaryIdx] = useState(0)

  const [form, setForm] = useState({
    name: '', slug: '', short_description: '', description: '',
    price: '', category_id: '', is_featured: false, is_active: true, tags: ''
  })

  useEffect(() => {
    if (!isEdit) return
    setFetching(true)
    api.get(`/admin/products/${id}`)
      .then(({ data }) => {
        const p = data.data
        setForm({
          name: p.name || '', slug: p.slug || '',
          short_description: p.short_description || '', description: p.description || '',
          price: p.price || '', category_id: p.category_id || '',
          is_featured: !!p.is_featured, is_active: !!p.is_active,
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '')
        })
        setExisting(p.images || [])
        const primIdx = p.images?.findIndex(img => img.is_primary) ?? 0
        setPrimaryIdx(primIdx >= 0 ? primIdx : 0)
      })
      .catch(() => toast.error('Error al cargar el producto'))
      .finally(() => setFetching(false))
  }, [id, isEdit])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    onDrop: (files) => setImages(prev => [...prev, ...files])
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && !isEdit
        ? { slug: value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') }
        : {})
    }))
  }

  const removeNewImage = (i) => setImages(prev => prev.filter((_, idx) => idx !== i))
  const removeExisting = (imgId) => setExisting(prev => prev.filter(img => img.id !== imgId))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    images.forEach(img => fd.append('images[]', img))
    if (existing.length > 0 && existing[primaryIdx]) {
      fd.append('primary_image_id', existing[primaryIdx].id)
    } else if (images.length > 0) {
      fd.append('primary_image_index', primaryIdx)
    }
    existing.forEach(img => fd.append('keep_image_ids[]', img.id))
    if (isEdit) fd.append('_method', 'PUT')

    try {
      if (isEdit) {
        await api.post(`/admin/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Producto actualizado')
      } else {
        await api.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Producto creado')
      }
      navigate('/admin/productos')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).flat().forEach(msg => toast.error(msg))
      } else {
        toast.error(err.response?.data?.message || 'Error al guardar')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/productos" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-800">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h1>
          <p className="text-sm text-neutral-400">{isEdit ? `Editando: ${form.name}` : 'Completa los campos'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-5">
              <h2 className="font-medium text-neutral-700 text-sm uppercase tracking-wider">Información básica</h2>

              <div>
                <label className="label">Nombre del producto *</label>
                <input name="name" value={form.name} onChange={handleChange} required className="input" placeholder="Ej: Silla ergonómica Oslo" />
              </div>

              <div>
                <label className="label">Slug (URL)</label>
                <div className="flex items-center input p-0 overflow-hidden">
                  <span className="px-3 py-3 text-sm text-neutral-400 bg-neutral-100 border-r border-neutral-200">/producto/</span>
                  <input name="slug" value={form.slug} onChange={handleChange} className="flex-1 px-3 py-3 bg-transparent text-sm focus:outline-none" placeholder="silla-ergonomica-oslo" />
                </div>
              </div>

              <div>
                <label className="label">Descripción corta</label>
                <textarea name="short_description" value={form.short_description} onChange={handleChange} rows={2} className="input resize-none" placeholder="Breve descripción del producto..." />
              </div>

              <div>
                <label className="label">Descripción completa</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} className="input resize-none" placeholder="Descripción detallada..." />
              </div>

              <div>
                <label className="label">Tags (separados por coma)</label>
                <input name="tags" value={form.tags} onChange={handleChange} className="input" placeholder="moderno, ergonómico, premium" />
              </div>
            </div>

            {/* Images */}
            <div className="card p-6">
              <h2 className="font-medium text-neutral-700 text-sm uppercase tracking-wider mb-4">Imágenes</h2>

              {/* Existing */}
              {existing.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {existing.map((img, i) => (
                    <div
                      key={img.id}
                      onClick={() => setPrimaryIdx(i)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${i === primaryIdx ? 'border-brand-400 ring-2 ring-brand-200' : 'border-transparent'}`}
                    >
                      <img src={resolveMediaUrl(img.url)} alt="" className="w-full h-full object-cover" />
                      {i === primaryIdx && (
                        <div className="absolute top-1 left-1 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-white" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeExisting(img.id) }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New images preview */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {images.map((file, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-brand-200">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-brand-400 bg-pastel-lavender/30' : 'border-neutral-200 hover:border-brand-300 hover:bg-neutral-50'}`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Arrastra imágenes aquí o <span className="text-brand-500">haz clic</span></p>
                <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WEBP hasta 5MB</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6 space-y-5">
              <h2 className="font-medium text-neutral-700 text-sm uppercase tracking-wider">Detalles</h2>

              <div>
                <label className="label">Precio (COP)</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} className="input" placeholder="0" min="0" />
              </div>

              <div>
                <label className="label">Categoría</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} className="input">
                  <option value="">Sin categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full transition-colors ${form.is_featured ? 'bg-brand-500' : 'bg-neutral-200'}`}
                    onClick={() => setForm(p => ({ ...p, is_featured: !p.is_featured }))}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${form.is_featured ? 'translate-x-4' : ''}`} />
                  </div>
                  <span className="text-sm text-neutral-700">Producto destacado</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-brand-500' : 'bg-neutral-200'}`}
                    onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${form.is_active ? 'translate-x-4' : ''}`} />
                  </div>
                  <span className="text-sm text-neutral-700">Producto activo</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4">
              {loading ? <Spinner size="sm" /> : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>

            <Link to="/admin/productos" className="btn-secondary w-full justify-center">Cancelar</Link>
          </div>
        </div>
      </form>
    </div>
  )
}
