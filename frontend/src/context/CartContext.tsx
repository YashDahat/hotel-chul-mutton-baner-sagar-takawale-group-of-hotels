import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem } from '@/types/local/cart';
import {
  getCart,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart as clearCartService,
} from '@/services/local/cartService';
import { UUID } from '@/types/uuid';

interface CartContextType {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: UUID) => void;
  updateQuantity: (menuItemId: UUID, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(getCart());

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleAddItem = (item: CartItem) => {
    const updatedCart = addItemToCart(item);
    setCart(updatedCart);
  };

  const handleRemoveItem = (menuItemId: UUID) => {
    const updatedCart = removeItemFromCart(menuItemId);
    setCart(updatedCart);
  };

  const handleUpdateQuantity = (menuItemId: UUID, quantity: number) => {
    const updatedCart = updateItemQuantity(menuItemId, quantity);
    setCart(updatedCart);
  };

  const handleClearCart = () => {
    clearCartService();
    setCart({ items: [], totalAmount: 0 });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem: handleAddItem,
        removeItem: handleRemoveItem,
        updateQuantity: handleUpdateQuantity,
        clearCart: handleClearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};