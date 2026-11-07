import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import CartSummary from '@/components/order/CartSummary';
import DeliveryAddressForm from '@/components/order/DeliveryAddressForm';
import PaymentOptions from '@/components/order/PaymentOptions';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/hooks/useOrders';
import { CreateOrderRequest, OrderItemRequest } from '@/types/order';
import { ROUTES } from '@/routes';
import { Button } from '@/components/ui/button';

type DeliveryAddressFormValues = {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { createOrder, loading, error } = useOrders();
  const [step, setStep] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddressFormValues | null>(null);

  const handleAddressSubmit = (address: DeliveryAddressFormValues) => {
    setDeliveryAddress(address);
    setStep(2);
  };

  const handlePaymentSuccess = async () => {
    if (!deliveryAddress || cart.items.length === 0) {
      alert('Please complete address details and ensure your cart is not empty.');
      return;
    }

    const orderItems: OrderItemRequest[] = cart.items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
    }));

    const orderRequest: CreateOrderRequest = {
      orderItems,
      deliveryAddress: {
        fullName: deliveryAddress.fullName,
        phoneNumber: deliveryAddress.phoneNumber,
        streetAddress: deliveryAddress.streetAddress,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        zipCode: deliveryAddress.zipCode,
      },
      orderType: 'DELIVERY', // Assuming 'DELIVERY' for now
      totalAmount: cart.totalAmount,
    };

    try {
      const newOrder = await createOrder(orderRequest);
      clearCart();
      navigate(ROUTES.ORDER_CONFIRMATION, { state: { orderId: newOrder.id } });
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('Failed to place order. Please try again.');
    }
  };

  if (cart.items.length === 0 && step === 1) {
    return (
      <Layout>
        <section className="py-16 px-4 bg-[#FFF8E1]">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#362419] mb-6">Your Cart is Empty</h1>
            <p className="text-lg text-gray-700 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button
              onClick={() => navigate(ROUTES.MENU)}
              className="bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200"
            >
              Go to Menu
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 px-4 bg-[#FFF8E1]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#362419] mb-10 text-center">Checkout</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error.message || 'An unexpected error occurred.'}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h2 className="text-2xl font-semibold mb-6 text-[#362419]">
                  Step 1: Delivery Information
                </h2>
                <DeliveryAddressForm onSubmit={handleAddressSubmit} />
              </div>

              {step === 2 && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <h2 className="text-2xl font-semibold mb-6 text-[#362419]">
                    Step 2: Payment Options
                  </h2>
                  <PaymentOptions onPaymentSuccess={handlePaymentSuccess} />
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CheckoutPage;