export interface Transaction {
  id: string;
  date: string; // ISO string
  type: "income" | "expense" | "savings";
  amount: number;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function getMonthlyTransactions(
  transactions: Transaction[],
  month: string
) {
  let income = 0;
  let expenses = 0;
  let savings = 0;

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    const txMonth = `${txDate.getFullYear()}-${String(
      txDate.getMonth() + 1
    ).padStart(2, "0")}`;
    if (txMonth === month) {
      if (tx.type === "income") {
        income += tx.amount;
      } else if (tx.type === "expense") {
        expenses += tx.amount;
      } else if (tx.type === "savings") {
        savings += tx.amount;
      }
    }
  });

  return { income, expenses, savings };
}
