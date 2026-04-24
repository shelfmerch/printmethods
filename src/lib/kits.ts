import { RAW_API_URL } from '@/config';

const getToken = () => localStorage.getItem('token');

async function request<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  if (auth && getToken()) {
    headers.set('Authorization', `Bearer ${getToken()}`);
  }

  const response = await fetch(`${RAW_API_URL}/api${path}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.success === false) {
    throw new Error(json.message || 'Request failed');
  }

  return json;
}

export const kitsApi = {
  list: (brandId: string) => request(`/kits?brandId=${encodeURIComponent(brandId)}`),
  get: (id: string) => request(`/kits/${encodeURIComponent(id)}`),
  create: (payload: any) => request('/kits', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: any) => request(`/kits/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => request(`/kits/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  listSends: (brandId: string) => request(`/kit-sends?brandId=${encodeURIComponent(brandId)}`),
  getSend: (id: string) => request(`/kit-sends/${encodeURIComponent(id)}`),
  createSendOrder: (payload: any) => request('/kit-sends/razorpay/create', { method: 'POST', body: JSON.stringify(payload) }),
  verifySendOrder: (payload: any) => request('/kit-sends/razorpay/verify', { method: 'POST', body: JSON.stringify(payload) }),
  closeSend: (id: string) => request(`/kit-sends/${encodeURIComponent(id)}/close`, { method: 'POST' }),
  resendInvites: (id: string) => request(`/kit-sends/${encodeURIComponent(id)}/resend-invites`, { method: 'POST' }),
  listRedemptions: (kitSendId: string) => request(`/kit-redemptions?kitSendId=${encodeURIComponent(kitSendId)}`),
  getByToken: (token: string) => request(`/kit-redemptions/token/${encodeURIComponent(token)}`, {}, false),
  redeemByToken: (token: string, payload: any) =>
    request(`/kit-redemptions/token/${encodeURIComponent(token)}/redeem`, { method: 'POST', body: JSON.stringify(payload) }, false),
};

export async function uploadKitLogo(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', 'kit-logos');

  const response = await fetch(`${RAW_API_URL}/api/upload/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.success === false) {
    throw new Error(json.message || 'Failed to upload logo');
  }

  return json.url as string;
}
