import { useQuery } from '@tanstack/react-query'

export const authClient = {
  baseURL: '/api/auth',
}

export const useSession = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const signIn = {
  social: async ({ provider }: { provider: string }) => {
    window.location.href = `/api/auth/${provider}`
  },
}

export const signOut = async () => {
  window.location.href = '/api/auth/signout'
}