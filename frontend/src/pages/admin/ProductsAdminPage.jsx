import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, Image, Package } from 'lucide-react'
import {
  useProducts, useCategories, useCreateProduct, useUpdateProduct,
  useDeleteProduct,
} from '../../hooks'
import {
  Modal, ConfirmDialog, Spinner, EmptyState, Pagination,
  Input, Textarea, Select, Badge,
} from '../../components/ui'
import { productsService } from '../../services'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { resolveMediaUrl } from '../../utils/media'

// ──── Product Form ─────────────────────────────────────────────────────────────
function ProductForm({ product, onSuccess, categories }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price ?? '',
    sku: product?.sku || '',
    stock: product?.stock ?? '',
    category_id: product?.category_id || '',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
  })
  const [loading, setLoading] = useState(false)
  const create = useCreateProduct()
  const update = useUpdateProduct()

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (product) {
        await update.mutateAsync({ id: product.id, data: form })
      } else {
        await create.mutateAsync(form)
      }
      onSuccess()
    } catch (_) {} finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input label="Nombre *" value={form.name} onChange={set('name')} required placeholder="Nombre del producto" />
        </div>
        <Textarea label="Descripción" value={form.description} onChange={set('description')} placeholder="Descripción del producto..." />
        <div className="space-y-4">
          <Input label="Precio" type="number" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" />
          <Input label="SKU" value={form.sku} onChange={set('sku')} placeholder="SKU-001" />
          <Input label="Stock" type="number" value={form.stock} onChange={set('stock')} placeholder="0" />
        </div>
        <Select
          label="Categoría"
          value={form.category_id}
          onChange={set('category_id')}
          placeholder="Sin categoría"
          options={categories?.data?.map((c) => ({ value: c.id, label: c.name }))}
        />
        <div className="flex flex-col gap-3 pt-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} className="w-4 h-4 rounded text-brand-600" />
            <span className="text-sm text-gray-700">Destacar producto</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={set('is_active')} className="w-4 h-4 rounded text-brand-600" />
            <span className="text-sm text-gray-700">Producto activo</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Spinner size={15} />}
          {product ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}

// ──── Image Manager ────────────────────────────────────────────────────────────
function ImageManager({ product }) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState(product.images || [])
  const qc = useQueryClient()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: async (files) => {
      setUploading(true)
      let uploadedCount = 0
      for (const file of files) {
        const fd = new FormData()
        fd.append('image', file)
        try {
          const response = await productsService.uploadImage(product.id, fd)
          const uploaded = response?.data
          if (uploaded) {
            setImages((prev) => [...prev, uploaded])
          }
          uploadedCount += 1
        } catch (error) {
          toast.error(error.response?.data?.message || 'Error subiendo imagen')
        }
      }
      if (uploadedCount > 0) {
        toast.success(
          uploadedCount === 1
            ? 'Imagen subida correctamente'
            : `${uploadedCount} imagenes subidas correctamente`,
        )
      }
      qc.invalidateQueries({ queryKey: ['products'] })
      setUploading(false)
    },
  })

  const handleDelete = async (imageId) => {
    try {
      await productsService.deleteImage(product.id, imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Imagen eliminada')
    } catch (_) {
      toast.error('Error al eliminar imagen')
    }
  }

  const handleSetPrimary = async (imageId) => {
    try {
      await productsService.setPrimaryImage(product.id, imageId)
      setImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId })),
      )
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Imagen principal actualizada')
    } catch (_) {}
  }

  return (
    <div>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4 ${isDragActive ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-brand-600">
            <Spinner size={18} /> Subiendo...
          </div>
        ) : (
          <div className="text-gray-400">
            <Image size={24} className="mx-auto mb-2" />
            <p className="text-sm">{isDragActive ? 'Suelta aquí' : 'Arrastra imágenes o haz clic'}</p>
          </div>
        )}
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-3 gap-3">
        {images?.map((img) => (
          <div key={img.id} className="relative group aspect-square">
            <img src={resolveMediaUrl(img.url)} alt="" className="w-full h-full object-cover rounded-xl" />
            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              {!img.is_primary && (
                <button
                  onClick={() => handleSetPrimary(img.id)}
                  className="text-xs bg-white text-gray-700 px-2 py-1 rounded-lg hover:bg-brand-50 hover:text-brand-700"
                >
                  Principal
                </button>
              )}
              <button
                onClick={() => handleDelete(img.id)}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg"
              >
                Eliminar
              </button>
            </div>
            {img.is_primary && (
              <div className="absolute top-1.5 left-1.5 bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">Principal</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ──── Main Page ────────────────────────────────────────────────────────────────
export default function ProductsAdminPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [imagesProduct, setImagesProduct] = useState(null)

  const { data, isLoading } = useProducts({ page, search: search || undefined, per_page: 15 })
  const { data: categories } = useCategories()
  const deleteM = useDeleteProduct()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-gray-900">Productos</h1>
          <p className="text-gray-400 text-sm mt-1">{data?.meta?.total || 0} productos</p>
        </div>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar productos..."
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">Producto</th>
              <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium uppercase tracking-wider hidden sm:table-cell">Categoría</th>
              <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium uppercase tracking-wider hidden md:table-cell">Precio</th>
              <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium uppercase tracking-wider hidden lg:table-cell">Estado</th>
              <th className="px-5 py-3 text-right text-xs text-gray-400 font-medium uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={5} className="py-12 text-center"><Spinner size={24} className="mx-auto" /></td></tr>
            ) : data?.data?.length === 0 ? (
              <tr><td colSpan={5} className="py-12">
                <EmptyState icon={Package} title="Sin productos" description="Crea tu primer producto." />
              </td></tr>
            ) : (
              data?.data?.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                        {product.images?.[0] ? (
                          <img src={resolveMediaUrl(product.images[0].url)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200">🛍</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        {product.sku && <p className="text-xs text-gray-400 font-mono">{product.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    {product.category ? <Badge variant="default">{product.category.name}</Badge> : <span className="text-gray-300 text-sm">—</span>}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700 hidden md:table-cell">
                    {product.price != null ? `$${Number(product.price).toLocaleString('es')}` : '—'}
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <Badge variant={product.is_active ? 'success' : 'default'}>
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setImagesProduct(product)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-600 transition-colors" title="Imágenes">
                        <Image size={15} />
                      </button>
                      <button onClick={() => setEditProduct(product)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteProduct(product)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} lastPage={data?.meta?.last_page || 1} onPageChange={setPage} />

      {/* Modals */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo producto" size="md">
        <ProductForm categories={categories} onSuccess={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Editar producto" size="md">
        {editProduct && (
          <ProductForm product={editProduct} categories={categories} onSuccess={() => setEditProduct(null)} />
        )}
      </Modal>

      <Modal open={!!imagesProduct} onClose={() => setImagesProduct(null)} title="Imágenes del producto" size="md">
        {imagesProduct && <ImageManager product={imagesProduct} />}
      </Modal>

      <ConfirmDialog
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        title="Eliminar producto"
        message={`¿Estás seguro de eliminar "${deleteProduct?.name}"? Esta acción no se puede deshacer.`}
        loading={deleteM.isPending}
        onConfirm={async () => {
          await deleteM.mutateAsync(deleteProduct.id)
          setDeleteProduct(null)
        }}
      />
    </div>
  )
}
