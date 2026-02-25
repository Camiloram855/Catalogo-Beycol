import { useProducts, useCategories } from '../../hooks'
import { Package, Tag, TrendingUp, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Spinner } from '../../components/ui'

function StatCard({ icon: Icon, label, value, color, to }) {
  return (
    <Link to={to} className="card p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{label}</p>
          {value != null ? (
            <p className="font-display text-4xl text-gray-900">{value}</p>
          ) : (
            <Spinner size={20} className="mt-2" />
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { data: allProducts } = useProducts({ per_page: 9999 })
  const { data: featured } = useProducts({ featured: true, per_page: 9999 })
  const { data: categories } = useCategories()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Resumen general del catálogo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <StatCard
          icon={Package}
          label="Total productos"
          value={allProducts?.meta?.total}
          color="bg-pastel-lavender text-brand-600"
          to="/admin/productos"
        />
        <StatCard
          icon={Star}
          label="Productos destacados"
          value={featured?.meta?.total}
          color="bg-pastel-yellow text-yellow-600"
          to="/admin/productos"
        />
        <StatCard
          icon={Tag}
          label="Categorías"
          value={categories?.data?.length}
          color="bg-pastel-mint text-green-600"
          to="/admin/categorias"
        />
      </div>

      {/* Recent products */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Productos recientes</h2>
          <Link to="/admin/productos" className="text-xs text-brand-600 hover:underline">Ver todos</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {allProducts?.data?.slice(0, 5).map((product) => (
            <div key={product.id} className="px-6 py-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                {product.images?.[0] ? (
                  <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200 text-lg">🛍</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-400">{product.category?.name}</p>
              </div>
              {product.price != null && (
                <p className="text-sm font-semibold text-gray-700">
                  ${Number(product.price).toLocaleString('es')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
