import { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import * as cartService from '../services/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch cart from backend on mount and when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      // Transform backend cart items to match our expected structure
      // Backend returns: { id, items: [{ id, product, quantity, price, subtotal }], total_amount }
      setCartItems(cartData.items || []);
    } catch (error) {
      // If cart doesn't exist (404), that's fine - just set empty array
      if (error.response?.status !== 404) {
        console.error('Error fetching cart:', error);
        message.error('Failed to load cart');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    // Support both product object and productId
    const productId = typeof product === 'object' ? product.id : product;
    
    try {
      setLoading(true);
      await cartService.addToCart(productId, quantity);
      // Refresh cart from backend
      await fetchCart();
      // Get product name for success message
      if (typeof product === 'object') {
        message.success(`${product.name} added to cart`);
      } else {
        message.success('Item added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.response?.data?.non_field_errors?.[0] || 
                          error.response?.data?.product_id?.[0] ||
                          'Failed to add item to cart';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productIdOrItemId) => {
    // Find the cart item by product ID or use itemId directly
    const cartItem = cartItems.find((item) => 
      item.id === productIdOrItemId || item.product.id === productIdOrItemId
    );
    
    if (!cartItem) {
      message.error('Item not found in cart');
      return;
    }

    try {
      setLoading(true);
      await cartService.removeCartItem(cartItem.id);
      // Refresh cart from backend
      await fetchCart();
      message.info('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      message.error('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productIdOrItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productIdOrItemId);
      return;
    }

    // Find the cart item by product ID or use itemId directly
    const cartItem = cartItems.find((item) => 
      item.id === productIdOrItemId || item.product.id === productIdOrItemId
    );
    
    if (!cartItem) {
      message.error('Item not found in cart');
      return;
    }

    try {
      setLoading(true);
      await cartService.updateCartItem(cartItem.id, quantity);
      // Refresh cart from backend
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.quantity?.[0] ||
                          'Failed to update item quantity';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.clearCart();
      setCartItems([]);
      message.info('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      message.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price || item.product?.price) || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartItems = () => {
    return cartItems;
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
    getCartItems,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};



