import { Transaction } from "../types";

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
      const amount = Number(tx.amount);
      if (isNaN(amount)) return; // Skip invalid amounts

      if (tx.type === "income") {
        income += amount;
      } else if (tx.type === "expense") {
        expenses += amount;
      } else if (tx.type === "savings") {
        savings += amount;
      }
    }
  });

  return {
    income: isNaN(income) ? 0 : income,
    expenses: isNaN(expenses) ? 0 : expenses,
    savings: isNaN(savings) ? 0 : savings,
  };
}
