import { APIRequestContext } from '@playwright/test';

export async function createTestProduct(
  request: APIRequestContext
) {
  return request.post('/api/products', {
    data: {
      name: 'Playwright Test Product',
      price: 999,
    },
  });
}

export async function createTestOrder(
  request: APIRequestContext
) {
  return request.post('/api/orders', {
    data: {
      productId: '123',
      quantity: 1,
    },
  });
}

export async function deleteTestProduct(
  request: APIRequestContext,
  id: string
) {
  return request.delete(`/api/products/${id}`);
}

export async function clearCart(
  request: APIRequestContext
) {
  return request.delete('/api/cart/clear');
}