import { Cart, CartItem } from '@/types/local/cart';
import { UUID } from '@/types/uuid';

const CART_STORAGE_KEY = 'chul-mutton-cart';

export const getCart = (): Cart => {
  if (typeof window === 'undefined') {
    return { items: [], totalAmount: 0 };
  }
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);
  return storedCart ? JSON.parse(storedCart) : { items: [], totalAmount: 0 };
};

export const saveCart = (cart: Cart): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
};

const calculateTotalAmount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const addItemToCart = (item: CartItem): Cart => {
  const currentCart = getCart();
  const existingItemIndex = currentCart.items.findIndex(
    (cartItem) => cartItem.menuItemId === item.menuItemId
  );

  let updatedItems;
  if (existingItemIndex > -1) {
    updatedItems = currentCart.items.map((cartItem, index) =>
      index === existingItemIndex
        ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
        : cartItem
    );
  } else {
    updatedItems = [...currentCart.items, item];
  }

  const newCart = {
    items: updatedItems,
    totalAmount: calculateTotalAmount(updatedItems),
  };
  saveCart(newCart);
  return newCart;
};

export const removeItemFromCart = (menuItemId: UUID): Cart => {
  const currentCart = getCart();
  const updatedItems = currentCart.items.filter(
    (item) => item.menuItemId !== menuItemId
  );

  const newCart = {
    items: updatedItems,
    totalAmount: calculateTotalAmount(updatedItems),
  };
  saveCart(newCart);
  return newCart;
};

export const updateItemQuantity = (menuItemId: UUID, quantity: number): Cart => {
  const currentCart = getCart();
  let updatedItems: CartItem[];

  if (quantity <= 0) {
    updatedItems = currentCart.items.filter(
      (item) => item.menuItemId !== menuItemId
    );
  } else {
    updatedItems = currentCart.items.map((item) =>
      item.menuItemId === menuItemId ? { ...item, quantity } : item
    );
  }

  const newCart = {
    items: updatedItems,
    totalAmount: calculateTotalAmount(updatedItems),
  };
  saveCart(newCart);
  return newCart;
};

export const clearCart = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
};