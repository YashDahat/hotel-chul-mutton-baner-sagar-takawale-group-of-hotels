import { UUID } from './utility';

export interface OrderItemRequest {
  menuItemId: UUID;
  quantity: number;
}

export interface CreateOrderRequest {
  orderItems: OrderItemRequest[];
  deliveryAddress: {
    fullName: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  orderType: 'DELIVERY' | 'PICKUP';
}

export interface OrderItemResponse {
  orderItemId: UUID;
  menuItemId: UUID;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface OrderResponse {
  orderId: UUID;
  userId: UUID;
  orderItems: OrderItemResponse[];
  totalAmount: number;
  orderDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  deliveryAddress: {
    fullName: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  orderType: 'DELIVERY' | 'PICKUP';
}