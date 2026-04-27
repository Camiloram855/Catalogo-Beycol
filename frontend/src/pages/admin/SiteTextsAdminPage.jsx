import { useState, useEffect } from 'react'
import { useSiteTexts, useBulkUpdateTexts, useUploadHeroBackground } from '../../hooks'
import { LoadingPage, Spinner } from '../../components/ui'
import { Save, FileText } from 'lucide-react'
import { resolveMediaUrl } from '../../utils/media'

const TEXT_GROUPS = [
  {
    group: 'Marca',
    keys: [
      { key: 'brand_name', label: 'Nombre de la marca', type: 'text' },
      { key: 'tagline', label: 'Eslogan', type: 'text' },
    ],
  },
  {
    group: 'Hero (página de inicio)',
    keys: [
      { key: 'hero_badge', label: 'Badge del hero', type: 'text' },
      { key: 'hero_title', label: 'Título principal', type: 'text' },
      { key: 'hero_subtitle', label: 'Subtítulo', type: 'textarea' },
    ],
  },
  {
    group: 'Secciones',
    keys: [
      { key: 'featured_title', label: 'Título de productos destacados', type: 'text' },
    ],
  },
  {
    group: 'Footer y contacto',
    keys: [
      { key: 'footer_description', label: 'Descripción del footer', type: 'textarea' },
      { key: 'contact_email', label: 'Email de contacto', type: 'text' },
      { key: 'contact_phone', label: 'Teléfono de contacto', type: 'text' },
    ],
  },
]

export default function SiteTextsAdminPage() {
  const { data: texts, isLoading } = useSiteTexts()
  const bulkUpdate = useBulkUpdateTexts()
  const uploadHeroBackground = useUploadHeroBackground()
  const [form, setForm] = useState({})
  const [heroFile, setHeroFile] = useState(null)

  useEffect(() => {
    if (texts) {
      const map = {}
      texts.forEach((t) => { map[t.key] = t.value })
      setForm(map)
    }
  }, [texts])

  const handleSave = async () => {
    await bulkUpdate.mutateAsync(form)
  }

  const handleUploadHeroBackground = async () => {
    if (!heroFile) return

    const formData = new FormData()
    formData.append('image', heroFile)

    const response = await uploadHeroBackground.mutateAsync(formData)
    const uploadedUrl = response?.data?.url || ''
    if (uploadedUrl) {
      setForm((prev) => ({ ...prev, hero_background_image: uploadedUrl }))
    }
    setHeroFile(null)
  }

  if (isLoading) return <LoadingPage />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-gray-900">Textos del sitio</h1>
          <p className="text-gray-400 text-sm mt-1">Edita el contenido visible en el sitio público</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={bulkUpdate.isPending}>
          {bulkUpdate.isPending ? <Spinner size={15} /> : <Save size={15} />}
          Guardar cambios
        </button>
      </div>

      <div className="space-y-6">
        {TEXT_GROUPS.map(({ group, keys }) => (
          <div key={group} className="card p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <FileText size={16} className="text-brand-400" />
              <h2 className="font-semibold text-gray-900">{group}</h2>
            </div>
            <div className="space-y-4">
              {keys.map(({ key, label, type }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={form[key] || ''}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="input-field resize-none"
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[key] || ''}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="input-field"
                    />
                  )}
                  <p className="text-xs text-gray-300 mt-1 font-mono">{key}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <FileText size={16} className="text-brand-400" />
            <h2 className="font-semibold text-gray-900">Portada del Hero desde dispositivo</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Subir imagen (JPG, PNG, WEBP - max 6MB)</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/*"
                onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
                className="input-field"
              />
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleUploadHeroBackground}
              disabled={!heroFile || uploadHeroBackground.isPending}
            >
              {uploadHeroBackground.isPending ? <Spinner size={15} /> : null}
              Subir portada
            </button>

            {form.hero_background_image ? (
              <div>
                <p className="text-xs text-gray-400 mb-2">Vista previa actual</p>
                <div className="w-full max-w-xl aspect-[16/7] rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                  <img
                    src={resolveMediaUrl(form.hero_background_image)}
                    alt="Portada hero"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button className="btn-primary" onClick={handleSave} disabled={bulkUpdate.isPending}>
          {bulkUpdate.isPending ? <Spinner size={15} /> : <Save size={15} />}
          Guardar todos los cambios
        </button>
      </div>
    </div>
  )
}

