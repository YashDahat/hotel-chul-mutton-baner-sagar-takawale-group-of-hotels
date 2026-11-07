import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrderById, getMyOrders } from '@/services/orderService';
import { CreateOrderRequest, OrderResponse } from '@/types/order';
import { UUID } from '@/types/utility';

const ORDER_QUERY_KEY = 'orders';
const MY_ORDERS_QUERY_KEY = 'myOrders';

export const useOrders = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  const {
    data: myOrders,
    isLoading: loadingMyOrders,
    error: myOrdersError,
    refetch: fetchMyOrders,
  } = useQuery<OrderResponse[], Error>({
    queryKey: [MY_ORDERS_QUERY_KEY],
    queryFn: getMyOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (err) => setError(err),
  });

  const createOrderMutation = useMutation<OrderResponse, Error, CreateOrderRequest>({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MY_ORDERS_QUERY_KEY] });
      setError(null);
    },
    onError: (err) => setError(err),
  });

  const getOrderByIdQuery = useCallback(async (orderId: UUID) => {
    try {
      const data = await getOrderById(orderId);
      setError(null);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  }, []);

  const loading = createOrderMutation.isPending || loadingMyOrders;
  const combinedError = error || myOrdersError || createOrderMutation.error;

  return {
    createOrder: createOrderMutation.mutateAsync,
    getOrderById: getOrderByIdQuery,
    myOrders: myOrders || [],
    loading,
    error: combinedError,
    fetchMyOrders,
  };
};