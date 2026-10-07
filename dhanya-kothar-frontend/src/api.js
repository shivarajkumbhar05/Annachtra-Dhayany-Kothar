const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const getToken = () => localStorage.getItem('dk_token');

export async function api(path, { method = 'GET', body, params } = {}) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    : '';
  const res = await fetch(BASE + path + qs, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() && { Authorization: `Bearer ${getToken()}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && getToken()) {
      localStorage.removeItem('dk_token');
      window.dispatchEvent(new Event('dk-logout'));
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}
