import { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'cart';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);

      if (existingItem) {
        // Check stock availability
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock_quantity !== undefined && newQuantity > product.stock_quantity) {
          message.warning(`Only ${product.stock_quantity} items available in stock`);
          return prevItems;
        }
        // Update quantity
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Check stock availability
        if (product.stock_quantity !== undefined && quantity > product.stock_quantity) {
          message.warning(`Only ${product.stock_quantity} items available in stock`);
          return prevItems;
        }
        // Add new item
        message.success(`${product.name} added to cart`);
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
    message.info('Item removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) => {
      const item = prevItems.find((item) => item.product.id === productId);
      if (item) {
        // Check stock availability
        if (item.product.stock_quantity !== undefined && quantity > item.product.stock_quantity) {
          message.warning(`Only ${item.product.stock_quantity} items available in stock`);
          return prevItems;
        }
        return prevItems.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
      }
      return prevItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    message.info('Cart cleared');
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price) || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartItems = () => {
    return cartItems;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
    getCartItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

