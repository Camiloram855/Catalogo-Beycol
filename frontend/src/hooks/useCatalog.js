import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  productsService,
  categoriesService,
  siteTextsService,
  imagesService
} from '../services/catalog'

// Products hooks
export const useProducts = (params) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: () => productsService.getAll(params).then(r => r.data),
  })

export const useProduct = (slug) =>
  useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsService.getBySlug(slug).then(r => r.data),
    enabled: !!slug,
  })

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => productsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

// Categories hooks
export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll().then(r => r.data),
  })

export const useCategoryProducts = (slug) =>
  useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesService.getBySlug(slug).then(r => r.data),
    enabled: !!slug,
  })

export const useCreateCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriesService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export const useUpdateCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => categoriesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export const useDeleteCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriesService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

// Site texts
export const useSiteTexts = (group) =>
  useQuery({
    queryKey: ['site-texts', group],
    queryFn: () => (group
      ? siteTextsService.getByGroup(group)
      : siteTextsService.getAll()
    ).then(r => r.data),
  })

export const useBulkUpdateTexts = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: siteTextsService.bulkUpdate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site-texts'] }),
  })
}

// Images
export const useImages = () =>
  useQuery({
    queryKey: ['images'],
    queryFn: () => imagesService.getAll().then(r => r.data),
  })

export const useUploadImage = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: imagesService.upload,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] }),
  })
}

export const useDeleteImage = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: imagesService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['images'] }),
  })
}
