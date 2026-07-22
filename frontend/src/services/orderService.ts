import apiClient from '../api/client';
import { CreateOrderRequest, OrderResponse } from '../types/order';
import { UUID } from '../types/utility';

export const createOrder = async (order: CreateOrderRequest): Promise<OrderResponse> => {
  const response = await apiClient.post<OrderResponse>('/api/v1/orders', order);
  return response.data;
};

export const getOrderById = async (orderId: UUID): Promise<OrderResponse> => {
  const response = await apiClient.get<OrderResponse>(`/api/v1/orders/${orderId}`);
  return response.data;
};

export const getMyOrders = async (): Promise<OrderResponse[]> => {
  const response = await apiClient.get<OrderResponse[]>('/api/v1/orders/my-orders');
  return response.data;
};