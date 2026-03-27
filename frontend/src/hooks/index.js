import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsService, categoriesService, siteTextsService, publicProductsService } from '../services'
import toast from 'react-hot-toast'

// ──── Products ────────────────────────────────────────────────────────────────

export function usePublicProducts(params) {
  return useQuery({
    queryKey: ['public-products', params],
    queryFn: () => publicProductsService.getAll(params),
  })
}


export function useProducts(params) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => publicProductsService.getAll(params),
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsService.getOne(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto creado exitosamente')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear producto'),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => productsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto actualizado')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar'),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productsService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto eliminado')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar'),
  })
}

// ──── Categories ──────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriesService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoría creada')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => categoriesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoría actualizada')
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriesService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoría eliminada')
    },
  })
}

// ──── Site Texts ──────────────────────────────────────────────────────────────

export function useSiteTexts() {
  return useQuery({
    queryKey: ['site-texts'],
    queryFn: siteTextsService.getAll,
  })
}

export function useBulkUpdateTexts() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: siteTextsService.bulkUpdate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-texts'] })
      toast.success('Textos guardados')
    },
    onError: () => toast.error('Error al guardar textos'),
  })
}
