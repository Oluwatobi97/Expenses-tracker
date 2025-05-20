export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">About Expense Tracker</h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Expense Tracker is designed to help you take control of your
              finances by providing a simple, intuitive way to track your
              income, expenses, and savings. Our goal is to make financial
              management accessible to everyone.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Track income, expenses, and savings</li>
              <li>Monthly summaries and analytics</li>
              <li>Category-based organization</li>
              <li>Dark mode support</li>
              <li>Responsive design for all devices</li>
              <li>Local storage for data persistence</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Have questions or suggestions? We'd love to hear from you! Reach
              out to us at:
              <br />
              <a
                href="mailto:support@expensetracker.com"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                support@expensetracker.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Version</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Current Version: 1.0.0
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
