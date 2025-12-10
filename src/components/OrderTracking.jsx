import React from 'react';
import { Check, Clock, Truck, Package } from 'lucide-react';

const OrderTracking = ({ status, isPaid }) => {
  const steps = [
    { label: 'Pending', icon: Clock, isActive: true }, // Always active if order exists
    { label: 'Processing', icon: Package, isActive: isPaid || status === 'Processing' || status === 'Shipped' || status === 'Delivered' },
    { label: 'Shipped', icon: Truck, isActive: status === 'Shipped' || status === 'Delivered' },
    { label: 'Delivered', icon: Check, isActive: status === 'Delivered' }
  ];

  if (status === 'Cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center font-bold">
        🚫 This order has been Cancelled.
      </div>
    )
  }

  // Calculate width percentage based on 3 intervals (33.33% each)
  let width = '0%';
  if (status === 'Delivered') width = '100%';
  else if (status === 'Shipped') width = '66.66%';
  else if (status === 'Processing' || isPaid) width = '33.33%';

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Bar Container - Constrained to centers of end icons (w-10 is 2.5rem/40px, so px-5/1.25rem aligns with center) */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full px-5">
          <div className="relative w-full h-1 bg-gray-200 rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-gold-500 rounded-full transition-all duration-500"
              style={{ width }}
            ></div>
          </div>
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step.isActive
                    ? 'bg-gold-500 border-gold-500 text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-400'
                  }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`mt-2 text-xs font-bold ${step.isActive ? 'text-brand-dark' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracking;