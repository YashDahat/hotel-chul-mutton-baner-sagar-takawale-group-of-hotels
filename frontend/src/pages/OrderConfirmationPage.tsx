import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { Layout } from '@/components/Layout';
import { ROUTES } from '@/routes';
import { UUID } from '@/types/utility';
import { OrderResponse } from '@/types/order';
import { Loader2 } from 'lucide-react';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: UUID }>();
  const navigate = useNavigate();
  const { getOrderById, loading, error } = useOrders();
  const [order, setOrder] = useState<OrderResponse | null>(null);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const fetchedOrder = await getOrderById(orderId);
          setOrder(fetchedOrder);
        } catch (err) {
          console.error('Failed to fetch order details:', err);
          navigate(ROUTES.HOME); // Redirect to home if order not found or error
        }
      };
      fetchOrder();
    } else {
      navigate(ROUTES.HOME); // Redirect if no orderId in URL
    }
  }, [orderId, getOrderById, navigate]);

  if (loading) {
    return (
      <Layout>
        <section className="py-16 px-4 min-h-[60vh] flex items-center justify-center">
          <div className="max-w-7xl mx-auto text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#A0522D] mx-auto" />
            <p className="mt-4 text-lg text-[#362419]">Loading order details...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="py-16 px-4 min-h-[60vh] flex items-center justify-center">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-red-600">Error</h2>
            <p className="mt-4 text-lg text-[#362419]">Failed to load order details. Please try again later.</p>
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="mt-8 bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200"
            >
              Go to Home
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <section className="py-16 px-4 min-h-[60vh] flex items-center justify-center">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#362419]">Order Not Found</h2>
            <p className="mt-4 text-lg text-[#362419]">The order you are looking for could not be found.</p>
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="mt-8 bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200"
            >
              Go to Home
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 px-4 bg-[#FFF8E1]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#A0522D]">Order Confirmed!</h1>
          <p className="mt-4 text-lg text-[#362419]">Thank you for your order. Your culinary journey begins soon!</p>
          <div className="mt-8 p-6 bg-white rounded-xl shadow-md border border-gray-100 text-left">
            <h2 className="text-2xl font-semibold text-[#362419]">Order #{order.orderNumber}</h2>
            <p className="mt-2 text-gray-600">Placed on: {new Date(order.orderDate).toLocaleDateString()}</p>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-[#362419]">Order Details</h3>
              <ul className="mt-4 space-y-2">
                {order.orderItems.map((item) => (
                  <li key={item.menuItemId} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                    <span className="text-[#362419]">{item.name} x {item.quantity}</span>
                    <span className="text-[#362419]">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 font-bold text-lg text-[#362419]">
                <span>Total:</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {order.deliveryAddress && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-[#362419]">Delivery Information</h3>
                <p className="mt-2 text-[#362419]">{order.deliveryAddress.fullName}</p>
                <p className="text-[#362419]">{order.deliveryAddress.streetAddress}</p>
                <p className="text-[#362419]">{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                <p className="text-[#362419]">Phone: {order.deliveryAddress.phoneNumber}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-[#362419]">Order Type</h3>
              <p className="mt-2 text-[#362419]">{order.orderType}</p>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate(ROUTES.ORDER_HISTORY)}
                className="bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200 mr-4"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate(ROUTES.MENU)}
                className="bg-gray-200 hover:bg-gray-300 text-[#362419] font-semibold rounded-full px-8 py-3 transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OrderConfirmationPage;