import React from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';
import { format } from 'date-fns';
import { Package } from 'lucide-react';

const OrderHistoryPage: React.FC = () => {
  const { myOrders, loading, error } = useOrders();

  if (loading) {
    return (
      <Layout>
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#362419] mb-8 text-center">Your Order History</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-full w-full"></div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#362419] mb-8">Error</h1>
            <p className="text-lg text-red-600">Failed to load orders: {error.message}</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[#362419] mb-8 text-center">Your Order History</h1>

          {myOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-24 w-24 text-gray-400 mb-6" />
              <h2 className="text-2xl font-semibold text-[#362419] mb-3">No orders found</h2>
              <p className="text-lg text-gray-600 mb-6">It looks like you haven't placed any orders yet.</p>
              <Link to={ROUTES.MENU}>
                <Button className="bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200">
                  Start Ordering
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myOrders.map((order) => (
                <Card key={order.id} className="p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-lg">
                  <div>
                    <h2 className="text-xl font-semibold text-[#362419] mb-2">Order #{order.orderNumber}</h2>
                    <p className="text-gray-600 text-sm mb-1">
                      Date: {format(new Date(order.orderDate), 'MMMM d, yyyy h:mm a')}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      Total: ₹{order.totalAmount.toFixed(2)}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-4">
                      {order.orderItems.slice(0, 3).map((item) => (
                        <li key={item.id} className="text-sm">
                          {item.quantity} x {item.name}
                        </li>
                      ))}
                      {order.orderItems.length > 3 && (
                        <li className="text-sm italic">...and {order.orderItems.length - 3} more items</li>
                      )}
                    </ul>
                  </div>
                  <Link to={`${ROUTES.ORDER_CONFIRMATION}?orderId=${order.id}`}>
                    <Button className="w-full bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-4 py-2 transition-all duration-200">
                      View Details
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default OrderHistoryPage;