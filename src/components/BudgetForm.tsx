
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type BudgetItem = {
  id: string;
  category: string;
  amount: number;
  type: "income" | "expense";
};

type BudgetFormProps = {
  onAddItem: (item: BudgetItem) => void;
};

export function BudgetForm({ onAddItem }: BudgetFormProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category",
        variant: "destructive",
      });
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    const newItem: BudgetItem = {
      id: crypto.randomUUID(),
      category: category.trim(),
      amount: amountValue,
      type,
    };
    
    onAddItem(newItem);
    
    // Reset form
    setCategory("");
    setAmount("");
    
    toast({
      title: "Success",
      description: `Added ${type}: ${category} - $${amountValue}`,
    });
  };

  return (
    <Card className="budget-card w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">
          Add Budget Item
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              className={`flex-1 ${type === "income" ? "bg-budgetBuddy-green text-white" : ""}`}
              onClick={() => setType("income")}
            >
              Income
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              className={`flex-1 ${type === "expense" ? "bg-budgetBuddy-red text-white" : ""}`}
              onClick={() => setType("expense")}
            >
              Expense
            </Button>
          </div>
          
          <div>
            <Input
              className="budget-input"
              placeholder="Category (e.g., Rent, Groceries)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          
          <div>
            <Input
              className="budget-input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <Button 
            type="submit" 
            className="budget-btn budget-btn-primary w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
