import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap flex-col-reverse lg:flex-row items-center gap-10 lg:gap-0">
            <div className="w-full lg:w-1/2 mt-10 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center lg:text-left">
                  Take Control of Your
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {" "}
                    Finances
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 text-center lg:text-left">
                  Track your expenses, manage your budget, and achieve your
                  financial goals with our powerful expense tracking app.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start">
                  <Link
                    to="/register"
                    className="px-6 py-3 sm:px-8 sm:py-3 text-base sm:text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors text-center"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/about"
                    className="px-6 py-3 sm:px-8 sm:py-3 text-base sm:text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors text-center"
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
            </div>
            <div className="w-full flex justify-center lg:justify-end lg:w-1/2 mt-8 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl"
              >
                <div className="relative z-10">
                  <img
                    src="/dashboard_screenshot.png.png"
                    alt="Dashboard Preview"
                    className="rounded-lg shadow-2xl w-full h-auto object-contain"
                  />
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-indigo-600 rounded-lg transform rotate-3"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
              Powerful Features
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Everything you need to manage your finances effectively
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-lg p-6 mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Smart Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically categorize and track your expenses with AI-powered
                insights
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-lg p-6 mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Detailed Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Visualize your spending patterns and make informed financial
                decisions
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-lg p-6 mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Secure & Private
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is encrypted and protected with enterprise-grade
                security
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-indigo-600 dark:bg-indigo-900">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-base sm:text-lg text-indigo-100 mb-6 sm:mb-8">
              Join thousands of users who are already managing their expenses
              effectively
            </p>
            <Link
              to="/register"
              className="px-6 py-3 sm:px-8 sm:py-3 text-base sm:text-lg font-medium text-indigo-600 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Start Free Trial
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
