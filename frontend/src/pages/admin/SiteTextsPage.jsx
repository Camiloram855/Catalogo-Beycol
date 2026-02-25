import { useState, useEffect } from 'react'
import { Save, FileText } from 'lucide-react'
import { useSiteTexts, useBulkUpdateTexts } from '../../hooks/useCatalog'
import { PageLoader, Spinner } from '../../components/shared/UI'
import toast from 'react-hot-toast'

const GROUPS = [
  {
    key: 'header',
    label: 'Encabezado',
    fields: [
      { key: 'header.brand_name', label: 'Nombre de la marca', type: 'text' },
    ]
  },
  {
    key: 'hero',
    label: 'Sección Hero (Inicio)',
    fields: [
      { key: 'hero.headline',    label: 'Título principal',  type: 'text' },
      { key: 'hero.subheadline', label: 'Subtítulo',         type: 'textarea' },
      { key: 'hero.cta_text',    label: 'Texto del botón',   type: 'text' },
    ]
  },
  {
    key: 'footer',
    label: 'Pie de página',
    fields: [
      { key: 'footer.description', label: 'Descripción',  type: 'textarea' },
      { key: 'footer.contact',     label: 'Contacto',     type: 'text' },
      { key: 'footer.copyright',   label: 'Copyright',    type: 'text' },
    ]
  }
]

export default function SiteTextsPage() {
  const { data, isLoading } = useSiteTexts()
  const { mutate: bulkUpdate, isPending } = useBulkUpdateTexts()
  const [values, setValues] = useState({})
  const [dirty, setDirty]   = useState(false)

  useEffect(() => {
    if (data?.data) {
      const map = {}
      Object.entries(data.data).forEach(([k, v]) => { map[k] = v.value })
      setValues(map)
    }
  }, [data])

  const handleChange = (key, value) => {
    setValues(p => ({ ...p, [key]: value }))
    setDirty(true)
  }

  const handleSave = () => {
    const texts = Object.entries(values).map(([key, value]) => ({ key, value }))
    bulkUpdate(texts, {
      onSuccess: () => { toast.success('Textos guardados'); setDirty(false) },
      onError: () => toast.error('Error al guardar'),
    })
  }

  if (isLoading) return <PageLoader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-800">Textos del sitio</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Edita el contenido visible en el sitio público</p>
        </div>
        <button onClick={handleSave} disabled={!dirty || isPending} className="btn-primary">
          {isPending ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
          Guardar cambios
        </button>
      </div>

      <div className="space-y-6">
        {GROUPS.map(group => (
          <div key={group.key} className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-4 h-4 text-brand-400" />
              <h2 className="font-medium text-neutral-700">{group.label}</h2>
            </div>
            <div className="space-y-5">
              {group.fields.map(field => (
                <div key={field.key}>
                  <label className="label">{field.label}</label>
                  <p className="text-xs text-neutral-400 mb-1.5 font-mono">{field.key}</p>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={values[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      rows={3}
                      className="input resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      className="input"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {dirty && (
        <div className="fixed bottom-6 right-6 animate-slide-up">
          <div className="card px-4 py-3 shadow-hard flex items-center gap-3">
            <span className="text-sm text-neutral-600">Cambios sin guardar</span>
            <button onClick={handleSave} disabled={isPending} className="btn-primary py-2 text-xs">
              {isPending ? <Spinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
