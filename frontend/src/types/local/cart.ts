import { UUID } from '@/types/uuid';

export type CartItem = {
  menuItemId: UUID;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type Cart = {
  items: CartItem[];
  totalAmount: number;
};