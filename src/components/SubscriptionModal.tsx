import React from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full mx-2 p-4 sm:p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-indigo-600 text-xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Choose Your Plan
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center ${
                plan.highlight
                  ? "border-2 border-indigo-600 dark:border-indigo-400"
                  : ""
              }`}
            >
              <h3 className="text-lg font-semibold mb-1 text-indigo-600 dark:text-indigo-400">
                {plan.name}
              </h3>
              <p className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {plan.price}
              </p>
              <ul className="mb-3 text-gray-600 dark:text-gray-300 text-center text-sm">
                <li>{plan.description}</li>
              </ul>
              <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded">
                {plan.badge}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            onClose();
            navigate("/subscriptions");
          }}
          className="mt-6 w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
        >
          View Plans
        </button>
        <button
          onClick={onClose}
          className="mt-3 w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SubscriptionModal;
