import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';

const CartSummary: React.FC = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    const item = cart.items.find((i) => i.menuItemId === menuItemId);
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity > 0) {
        updateQuantity(menuItemId, newQuantity);
      } else {
        removeItem(menuItemId);
      }
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xl text-gray-600">Your cart is empty.</p>
        <Link to={ROUTES.MENU}>
          <Button className="mt-4 bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200">
            Go to Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <h2 className="text-2xl font-semibold mb-6 text-[#362419]">Your Cart</h2>
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.menuItemId} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-center space-x-4">
              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
              <div>
                <h3 className="font-medium text-[#362419]">{item.name}</h3>
                <p className="text-sm text-gray-600">₹{item.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUpdateQuantity(item.menuItemId, -1)}
                className="text-gray-600 hover:text-[#A0522D]"
              >
                <MinusCircle className="h-5 w-5" />
              </Button>
              <span className="font-medium text-[#362419]">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUpdateQuantity(item.menuItemId, 1)}
                className="text-gray-600 hover:text-[#A0522D]"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.menuItemId)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <span className="text-xl font-semibold text-[#362419]">Total:</span>
        <span className="text-2xl font-bold text-[#A0522D]">₹{cart.totalAmount.toFixed(2)}</span>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
        <Button
          onClick={clearCart}
          variant="outline"
          className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          Clear Cart
        </Button>
        <Link to={ROUTES.CHECKOUT} className="w-full sm:w-auto">
          <Button className="w-full bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CartSummary;