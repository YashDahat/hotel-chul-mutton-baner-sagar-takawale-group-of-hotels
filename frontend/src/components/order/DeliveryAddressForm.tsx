import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const deliveryAddressSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  phoneNumber: z.string().min(10, 'Phone Number must be at least 10 digits'),
  streetAddress: z.string().min(1, 'Street Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip Code is required'),
});

type DeliveryAddressFormValues = z.infer<typeof deliveryAddressSchema>;

interface DeliveryAddressFormProps {
  onSubmit: (address: DeliveryAddressFormValues) => void;
}

const DeliveryAddressForm: React.FC<DeliveryAddressFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryAddressFormValues>({
    resolver: zodResolver(deliveryAddressSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
          Full Name
        </Label>
        <Input
          id="fullName"
          {...register('fullName')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A0522D] focus:ring-[#A0522D]"
        />
        {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
      </div>
      <div>
        <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
          Phone Number
        </Label>
        <Input
          id="phoneNumber"
          {...register('phoneNumber')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A0522D] focus:ring-[#A0522D]"
        />
        {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
      </div>
      <div>
        <Label htmlFor="streetAddress" className="text-sm font-medium text-gray-700">
          Street Address
        </Label>
        <Input
          id="streetAddress"
          {...register('streetAddress')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A0522D] focus:ring-[#A0522D]"
        />
        {errors.streetAddress && <p className="mt-1 text-sm text-red-600">{errors.streetAddress.message}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
            City
          </Label>
          <Input
            id="city"
            {...register('city')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A0522D] focus:ring-[#A0522D]"
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
        </div>
        <div>
          <Label htmlFor="state" className="text-sm font-medium text-gray-700">
            State
          </Label>
          <Input
            id="state"
            {...register('state')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A0522D] focus:ring-[#A0522D]"
          />
          {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
        </div>
        <div>
          <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
            Zip Code
          </Label>
          <Input
            id="zipCode"
            {...register('zipCode')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A0522D] focus:ring-[#A0522D]"
          />
          {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>}
        </div>
      </div>
      <Button type="submit" className="w-full bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200">
        Continue to Payment
      </Button>
    </form>
  );
};

export default DeliveryAddressForm;