import { getUserLimit } from "../models/userLimit.js";
import {
  createNotification,
  getUserNotifications,
} from "../models/notification.js";
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
      if (!t.created_at) return false;
      const transactionDate = new Date(t.created_at)
        .toISOString()
        .split("T")[0];
      return transactionDate === today && t.type === "expense";
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  console.log(
    `[LimitCheck] User ${user_id} - Today: ${today}, Expenses: ${todayExpenses}, Limit: ${userLimit.daily_limit}`
  );

  if (todayExpenses >= userLimit.daily_limit) {
    // Only create one notification per day
    const notifications = await getUserNotifications(user_id);
    const alreadyNotified = notifications.some(
      (n) =>
        n.message.includes("Daily spending limit alert") &&
        n.created_at &&
        new Date(n.created_at).toISOString().split("T")[0] === today
    );
    if (!alreadyNotified) {
      const message = `⚠️ Daily spending limit alert! You've spent ${todayExpenses.toFixed(
        2
      )} today, which has reached or exceeded your daily limit of ${userLimit.daily_limit.toFixed(
        2
      )}.`;
      await createNotification(user_id, message);
      console.log(
        `[LimitCheck] Daily limit notification created for user ${user_id}`
      );
    } else {
      console.log(
        `[LimitCheck] Daily limit notification already exists for user ${user_id}`
      );
    }
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
      if (!t.created_at) return false;
      const transactionDate = new Date(t.created_at);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        t.type === "expense"
      );
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  console.log(
    `[LimitCheck] User ${user_id} - Month: ${
      currentMonth + 1
    }/${currentYear}, Expenses: ${monthlyExpenses}, Limit: ${
      userLimit.monthly_limit
    }`
  );

  if (monthlyExpenses >= userLimit.monthly_limit) {
    // Only create one notification per month
    const notifications = await getUserNotifications(user_id);
    const alreadyNotified = notifications.some((n) => {
      if (!n.message.includes("Monthly spending limit alert") || !n.created_at)
        return false;
      const notifDate = new Date(n.created_at);
      return (
        notifDate.getMonth() === currentMonth &&
        notifDate.getFullYear() === currentYear
      );
    });
    if (!alreadyNotified) {
      const message = `⚠️ Monthly spending limit alert! You've spent ${monthlyExpenses.toFixed(
        2
      )} this month, which has reached or exceeded your monthly limit of ${userLimit.monthly_limit.toFixed(
        2
      )}.`;
      await createNotification(user_id, message);
      console.log(
        `[LimitCheck] Monthly limit notification created for user ${user_id}`
      );
    } else {
      console.log(
        `[LimitCheck] Monthly limit notification already exists for user ${user_id}`
      );
    }
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
