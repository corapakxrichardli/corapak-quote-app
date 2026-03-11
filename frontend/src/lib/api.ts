const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || res.statusText);
  }
  return res.json();
}

export const api = {
  customers: {
    list: () => fetchApi<{ id: string; name: string }[]>(('/customers')),
    get: (id: string) => fetchApi<{ id: string; name: string }>((`/customers/${id}`)),
    create: (data: { name: string; pricing_tier?: string; default_payment_terms?: string }) =>
      fetchApi<{ id: string; name: string }>(('/customers'), { method: 'POST', body: JSON.stringify(data) }),
  },
  customerCommitments: {
    list: () => fetchApi<{ id: string; type: string }[]>(('/customer-commitments')),
  },
  quotes: {
    list: (params?: { status?: string }) => {
      const q = params?.status ? `?status=${params.status}` : '';
      return fetchApi<any[]>((`/quotes${q}`));
    },
    get: (id: string) => fetchApi<any>((`/quotes/${id}`)),
    create: (data: object) => fetchApi<any>(('/quotes'), { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: object) => fetchApi<any>((`/quotes/${id}`), { method: 'PUT', body: JSON.stringify(data) }),
    calculate: (id: string) => fetchApi<any>((`/quotes/${id}/calculate`), { method: 'POST' }),
    preview: (id: string) => fetchApi<any>((`/quotes/${id}/preview`), { method: 'POST' }),
  },
};
