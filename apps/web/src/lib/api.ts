import { env } from '../env';

type FetchOptions = RequestInit & {
  token?: string | null;
};

export async function apiClient<T>(path: string, options: FetchOptions = {}): Promise<T> {
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
