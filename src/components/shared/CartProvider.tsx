
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from './ProductCard';

interface CartItem extends Product {
  cartQuantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const productId = product._id || product.sku; // Use _id if available, fallback to sku
      const existingItem = prev.find(item => (item._id || item.sku) === productId);
      
      if (existingItem) {
        return prev.map(item =>
          (item._id || item.sku) === productId
            ? { ...item, cartQuantity: Math.min(item.cartQuantity + 1, product.quantity) }
            : item
        );
      } else {
        return [...prev, { ...product, cartQuantity: 1 }];
      }
    });
    console.log('Added to cart:', product.name);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => (item._id || item.sku) !== productId));
    console.log('Removed from cart:', productId);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        (item._id || item.sku) === productId
          ? { ...item, cartQuantity: Math.min(quantity, item.quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    console.log('Cart cleared');
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.cartQuantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
