import { useState, useEffect } from 'react'
import { useSiteTexts, useBulkUpdateTexts } from '../../hooks'
import { LoadingPage, Spinner } from '../../components/ui'
import { Save, FileText } from 'lucide-react'

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
  const [form, setForm] = useState({})

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
