import api from './api';

export const getCart = async () => {
  const response = await api.get('/cart/');
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/cart/', {
    product_id: productId,
    quantity: quantity,
  });
  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.patch(`/cart/items/${itemId}/`, {
    quantity: quantity,
  });
  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/cart/items/${itemId}/`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart/');
  return response.data;
};

export const checkoutCart = async (shippingAddress, billingAddress, clearCartAfterCheckout = true) => {
  const response = await api.post('/cart/checkout/', {
    shipping_address: shippingAddress,
    billing_address: billingAddress || shippingAddress,
    clear_cart: clearCartAfterCheckout,
  });
  return response.data;
};


