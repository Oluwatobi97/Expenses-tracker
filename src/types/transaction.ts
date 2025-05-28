export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "savings";
  user_id: string;
  created_at: string;
  updated_at: string;
}
