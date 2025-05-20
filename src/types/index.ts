export * from "./transaction";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "savings";
}

export const defaultCategories: Category[] = [
  { id: "1", name: "Salary", type: "income" },
  { id: "2", name: "Freelance", type: "income" },
  { id: "3", name: "Investments", type: "income" },
  { id: "4", name: "Food", type: "expense" },
  { id: "5", name: "Transportation", type: "expense" },
  { id: "6", name: "Housing", type: "expense" },
  { id: "7", name: "Utilities", type: "expense" },
  { id: "8", name: "Entertainment", type: "expense" },
  { id: "9", name: "Emergency Fund", type: "savings" },
  { id: "10", name: "Retirement", type: "savings" },
  { id: "11", name: "Vacation Fund", type: "savings" },
];
