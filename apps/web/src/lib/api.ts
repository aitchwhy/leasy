import { env } from '../env';

type FetchOptions = RequestInit & {
  token?: string | null;
};

async function fetcher<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const apiClient = {
  get: <T>(path: string, options?: FetchOptions) => fetcher<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, data: any, options?: FetchOptions) => fetcher<T>(path, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data: any, options?: FetchOptions) => fetcher<T>(path, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(path: string, options?: FetchOptions) => fetcher<T>(path, { ...options, method: 'DELETE' }),
};
