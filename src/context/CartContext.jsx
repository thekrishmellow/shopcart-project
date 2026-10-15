import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getCart as getCartApi,
  addToCart as addToCartApi,
  updateCartQuantity as updateCartQuantityApi,
  removeFromCart as removeFromCartApi
} from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemLoadingMap, setItemLoadingMap] = useState({});

  // Fetch cart when authenticated user changes
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCartApi();
      if (data && data.cart) {
        setCartItems(data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart state:', err);
      if (err.response?.status === 401) {
        setCartItems([]);
      } else {
        setError(err.response?.data?.message || 'Unable to load your cart.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Set individual item loading helper
  const setItemLoading = (productId, isLoading) => {
    setItemLoadingMap((prev) => ({ ...prev, [productId]: isLoading }));
  };

  // Add product to cart (or increment quantity)
  const addToCart = async (productId) => {
    if (!user) {
      return { success: false, requireAuth: true, message: 'Please sign in to add products to cart.' };
    }

    try {
      setItemLoading(productId, true);
      setError(null);
      const data = await addToCartApi(productId);
      if (data && data.cart) {
        setCartItems(data.cart);
      }
      return { success: true, message: data.message || 'Product added to cart', cart: data.cart };
    } catch (err) {
      console.error('Error adding to cart:', err);
      const msg = err.response?.data?.message || 'Failed to add product to cart.';
      return { success: false, message: msg, status: err.response?.status };
    } finally {
      setItemLoading(productId, false);
    }
  };

  // Update product quantity in cart
  const updateQuantity = async (productId, quantity) => {
    if (!user) {
      return { success: false, requireAuth: true, message: 'Please sign in.' };
    }

    try {
      setItemLoading(productId, true);
      setError(null);
      const data = await updateCartQuantityApi(productId, quantity);
      if (data && data.cart) {
        setCartItems(data.cart);
      }
      return { success: true, message: data.message || 'Cart updated', cart: data.cart };
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      const msg = err.response?.data?.message || 'Failed to update quantity.';
      return { success: false, message: msg, status: err.response?.status };
    } finally {
      setItemLoading(productId, false);
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    if (!user) {
      return { success: false, requireAuth: true, message: 'Please sign in.' };
    }

    try {
      setItemLoading(productId, true);
      setError(null);
      const data = await removeFromCartApi(productId);
      if (data && data.cart) {
        setCartItems(data.cart);
      }
      return { success: true, message: data.message || 'Product removed from cart', cart: data.cart };
    } catch (err) {
      console.error('Error removing from cart:', err);
      const msg = err.response?.data?.message || 'Failed to remove item from cart.';
      return { success: false, message: msg, status: err.response?.status };
    } finally {
      setItemLoading(productId, false);
    }
  };

  // Derived values from state
  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return sum + (price * qty);
    }, 0);
  }, [cartItems]);

  const isInCart = useCallback((productId) => {
    return cartItems.some((item) => {
      const pId = item.product?._id || item.product;
      return pId?.toString() === productId?.toString();
    });
  }, [cartItems]);

  const getItemQuantity = useCallback((productId) => {
    const found = cartItems.find((item) => {
      const pId = item.product?._id || item.product;
      return pId?.toString() === productId?.toString();
    });
    return found ? found.quantity : 0;
  }, [cartItems]);

  const value = {
    cartItems,
    loading,
    error,
    itemLoadingMap,
    cartItemCount,
    subtotal,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
