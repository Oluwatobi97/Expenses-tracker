export interface Transaction {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "savings";
  category: string;
}
