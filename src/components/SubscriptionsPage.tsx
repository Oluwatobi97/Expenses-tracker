import React from "react";

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

const SubscriptionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Subscription Plans
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
          Choose the plan that best fits your needs. Upgrade anytime!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex flex-col items-center ${
                plan.highlight
                  ? "border-2 border-indigo-600 dark:border-indigo-400"
                  : ""
              }`}
            >
              <h3 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-400">
                {plan.name}
              </h3>
              <p className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
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

export default SubscriptionsPage;
