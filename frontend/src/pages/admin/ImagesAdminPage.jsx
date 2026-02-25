import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Trash2, Image } from 'lucide-react'
import { useImages, useUploadImage, useDeleteImage } from '../../hooks/useCatalog'
import { PageLoader, ConfirmModal, Spinner } from '../../components/shared/UI'
import toast from 'react-hot-toast'

export default function ImagesAdminPage() {
  const [deleteId, setDeleteId] = useState(null)
  const [uploading, setUploading] = useState(false)

  const { data, isLoading }                       = useImages()
  const { mutate: upload }                        = useUploadImage()
  const { mutate: deleteImg, isPending: deleting } = useDeleteImage()

  const baseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:8000'
  const images = data?.data || []

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    onDrop: async (files) => {
      setUploading(true)
      const fd = new FormData()
      files.forEach(f => fd.append('images[]', f))
      upload(fd, {
        onSuccess: () => toast.success(`${files.length} imagen(es) subida(s)`),
        onError: () => toast.error('Error al subir imágenes'),
        onSettled: () => setUploading(false),
      })
    }
  })

  const handleDelete = () => {
    deleteImg(deleteId, {
      onSuccess: () => { toast.success('Imagen eliminada'); setDeleteId(null) },
      onError: () => toast.error('Error al eliminar'),
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-neutral-800">Imágenes</h1>
        <p className="text-sm text-neutral-400 mt-0.5">{images.length} imágenes en la biblioteca</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all mb-8 ${
          isDragActive ? 'border-brand-400 bg-pastel-lavender/30' : 'border-neutral-200 hover:border-brand-300 hover:bg-neutral-50'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <p className="text-sm text-neutral-500">Subiendo imágenes...</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-pastel-lavender rounded-3xl flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-brand-400" />
            </div>
            <p className="text-sm font-medium text-neutral-700">
              {isDragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WEBP · Múltiples archivos permitidos</p>
          </>
        )}
      </div>

      {/* Gallery */}
      {isLoading ? (
        <PageLoader />
      ) : images.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Sin imágenes. Sube algunas arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {images.map(img => (
            <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-100">
            <img
              src={`${baseUrl}/storage/${img.path}`}
              alt={img.filename}
              className="w-full h-full object-cover"
            />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <button
                  onClick={() => setDeleteId(img.id)}
                  className="opacity-0 group-hover:opacity-100 btn-danger py-1.5 px-2.5 text-xs transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {img.product_name && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-xs truncate">{img.product_name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Eliminar imagen"
        description="¿Eliminar esta imagen permanentemente? Si está asociada a un producto, quedará sin imagen."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}
