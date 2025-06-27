import React from "react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    name: "Free Plan",
    price: "₦0",
    description: "User can only have 2 profiles",
    badge: "Best for personal use",
    highlight: false,
  },
  {
    name: "Standard Plan",
    price: "₦5,000",
    description: "User can only have 5 profiles",
    badge: "Great for families",
    highlight: true,
  },
  {
    name: "Pro Plan",
    price: "₦10,000",
    description: "User can have up to 10 profiles",
    badge: "Perfect for teams & pros",
    highlight: false,
  },
];

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-indigo-600 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Choose Your Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center ${
                plan.highlight
                  ? "border-2 border-indigo-600 dark:border-indigo-400"
                  : ""
              }`}
            >
              <h3 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-400">
                {plan.name}
              </h3>
              <p className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                {plan.price}
              </p>
              <ul className="mb-6 text-gray-600 dark:text-gray-300 text-center">
                <li>{plan.description}</li>
              </ul>
              <span className="inline-block px-4 py-2 text-sm font-medium bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded">
                {plan.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
