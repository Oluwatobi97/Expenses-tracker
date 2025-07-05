import { getUserLimit } from "../models/userLimit.js";
import { createNotification } from "../models/notification.js";
import { Transaction } from "../types/index.js";

export async function checkDailyLimit(
  user_id: number,
  transactions: Transaction[]
): Promise<void> {
  const userLimit = await getUserLimit(user_id);

  if (!userLimit || !userLimit.daily_limit_enabled || !userLimit.daily_limit) {
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const todayExpenses = transactions
    .filter((t) => {
      const transactionDate = new Date(t.created_at)
        .toISOString()
        .split("T")[0];
      return transactionDate === today && t.type === "expense";
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (todayExpenses >= userLimit.daily_limit) {
    const message = `⚠️ Daily spending limit alert! You've spent ${todayExpenses.toFixed(
      2
    )} today, which has reached or exceeded your daily limit of ${userLimit.daily_limit.toFixed(
      2
    )}.`;

    await createNotification(user_id, message);
  }
}

export async function checkMonthlyLimit(
  user_id: number,
  transactions: Transaction[]
): Promise<void> {
  const userLimit = await getUserLimit(user_id);

  if (
    !userLimit ||
    !userLimit.monthly_limit_enabled ||
    !userLimit.monthly_limit
  ) {
    return;
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = transactions
    .filter((t) => {
      const transactionDate = new Date(t.created_at);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        t.type === "expense"
      );
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (monthlyExpenses >= userLimit.monthly_limit) {
    const message = `⚠️ Monthly spending limit alert! You've spent ${monthlyExpenses.toFixed(
      2
    )} this month, which has reached or exceeded your monthly limit of ${userLimit.monthly_limit.toFixed(
      2
    )}.`;

    await createNotification(user_id, message);
  }
}

export async function checkLimits(
  user_id: number,
  transactions: Transaction[]
): Promise<void> {
  await Promise.all([
    checkDailyLimit(user_id, transactions),
    checkMonthlyLimit(user_id, transactions),
  ]);
}
