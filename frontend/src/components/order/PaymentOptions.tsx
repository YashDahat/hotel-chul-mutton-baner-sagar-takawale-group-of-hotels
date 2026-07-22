import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PaymentOptionsProps {
  onPaymentSuccess: () => void;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ onPaymentSuccess }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'online' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000); // Simulate a 2-second payment processing time
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <h2 className="text-xl font-semibold mb-4 text-[#362419]">Payment Options</h2>
      <div className="space-y-4">
        <div
          className={`flex items-center p-4 border rounded-md cursor-pointer transition-all duration-200 ${
            selectedPaymentMethod === 'cod' ? 'border-[#A0522D] ring-2 ring-[#A0522D]' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedPaymentMethod('cod')}
        >
          <input
            type="radio"
            id="cod"
            name="paymentMethod"
            value="cod"
            checked={selectedPaymentMethod === 'cod'}
            onChange={() => setSelectedPaymentMethod('cod')}
            className="form-radio h-4 w-4 text-[#A0522D] focus:ring-[#A0522D]"
          />
          <label htmlFor="cod" className="ml-3 block text-base font-medium text-[#362419]">
            Cash on Delivery
          </label>
        </div>

        <div
          className={`flex items-center p-4 border rounded-md cursor-pointer transition-all duration-200 ${
            selectedPaymentMethod === 'online' ? 'border-[#A0522D] ring-2 ring-[#A0522D]' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedPaymentMethod('online')}
        >
          <input
            type="radio"
            id="online"
            name="paymentMethod"
            value="online"
            checked={selectedPaymentMethod === 'online'}
            onChange={() => setSelectedPaymentMethod('online')}
            className="form-radio h-4 w-4 text-[#A0522D] focus:ring-[#A0522D]"
          />
          <label htmlFor="online" className="ml-3 block text-base font-medium text-[#362419]">
            Online Payment (Simulated)
          </label>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={!selectedPaymentMethod || isProcessing}
        className="mt-6 w-full bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200"
      >
        {isProcessing ? 'Processing Payment...' : 'Confirm Order & Pay'}
      </Button>
    </div>
  );
};

export default PaymentOptions;