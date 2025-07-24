import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { 
  Building, 
  Lease, 
  Invoice, 
  CreateInvoiceRequest,
  CreateInvoiceResponse 
} from '@/shared/types'

// Base API URL - in production this would come from environment variable
const API_BASE = '/api'

// Fetch helpers
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' })) as { error?: string }
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }
  return response.json()
}

async function postJson<TRequest, TResponse>(
  url: string, 
  data: TRequest
): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' })) as { error?: string }
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }
  
  return response.json()
}

// Buildings hook
export function useBuildings() {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: () => fetchJson<Building[]>(`${API_BASE}/buildings`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Leases hook
export function useLeases(buildingId: string | null) {
  return useQuery({
    queryKey: ['leases', buildingId],
    queryFn: () => 
      buildingId 
        ? fetchJson<Lease[]>(`${API_BASE}/leases?building_id=${buildingId}`)
        : Promise.resolve([]),
    enabled: !!buildingId,
  })
}

// Single invoice hook
export function useInvoice(invoiceId: string | null) {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => 
      invoiceId 
        ? fetchJson<Invoice>(`${API_BASE}/invoices/${invoiceId}`)
        : Promise.resolve(null),
    enabled: !!invoiceId,
  })
}

// All invoices hook
export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      // Since we don't have a GET /invoices endpoint, we'll use the store data
      // In a real app, this would be a proper API call
      const response = await fetch(`${API_BASE}/buildings`)
      if (response.ok) {
        // For now, return empty array as we don't have a list endpoint
        return [] as Invoice[]
      }
      throw new Error('Failed to fetch invoices')
    },
  })
}

// Create invoice mutation
export function useCreateInvoice() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) => 
      postJson<CreateInvoiceRequest, CreateInvoiceResponse>(
        `${API_BASE}/invoices`, 
        data
      ),
    onSuccess: (data) => {
      toast.success('Invoice created successfully', {
        description: `Invoice ID: ${data.invoice_id}`,
      })
      // Invalidate invoices list
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: Error) => {
      toast.error('Failed to create invoice', {
        description: error.message,
      })
    },
  })
}