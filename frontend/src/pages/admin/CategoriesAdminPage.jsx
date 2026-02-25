import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import {
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
} from '../../hooks'
import { Modal, ConfirmDialog, Input, Textarea, EmptyState, Spinner } from '../../components/ui'

function CategoryForm({ category, onSuccess }) {
  const [form, setForm] = useState({ name: category?.name || '', description: category?.description || '' })
  const [loading, setLoading] = useState(false)
  const create = useCreateCategory()
  const update = useUpdateCategory()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (category) {
        await update.mutateAsync({ id: category.id, data: form })
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
      <Input label="Nombre *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
      <Textarea label="Descripción" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Spinner size={14} />}
          {category ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </form>
  )
}

export default function CategoriesAdminPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [deleteCategory, setDeleteCategory] = useState(null)
  const { data: categories, isLoading } = useCategories()
  const deleteM = useDeleteCategory()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-gray-900">Categorías</h1>
          <p className="text-gray-400 text-sm mt-1">{categories?.data?.length || 0} categorías</p>
        </div>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size={28} /></div>
      ) : categories?.data?.length === 0 ? (
        <EmptyState icon={Tag} title="Sin categorías" description="Crea la primera categoría." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.data.map((cat) => (
            <div key={cat.id} className="card p-5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-pastel-lavender rounded-xl flex items-center justify-center shrink-0">
                  <Tag size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{cat.name}</p>
                  {cat.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{cat.description}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-1 font-mono">{cat.slug}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditCategory(cat)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteCategory(cat)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva categoría" size="sm">
        <CategoryForm onSuccess={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editCategory} onClose={() => setEditCategory(null)} title="Editar categoría" size="sm">
        {editCategory && <CategoryForm category={editCategory} onSuccess={() => setEditCategory(null)} />}
      </Modal>

      <ConfirmDialog
        open={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        title="Eliminar categoría"
        message={`¿Eliminar la categoría "${deleteCategory?.name}"? Los productos asociados perderán su categoría.`}
        loading={deleteM.isPending}
        onConfirm={async () => {
          await deleteM.mutateAsync(deleteCategory.id)
          setDeleteCategory(null)
        }}
      />
    </div>
  )
}
