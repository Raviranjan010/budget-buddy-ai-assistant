
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { BudgetItem } from "./BudgetForm";

type BudgetListProps = {
  items: BudgetItem[];
  onDeleteItem: (id: string) => void;
};

export function BudgetList({ items, onDeleteItem }: BudgetListProps) {
  const incomeItems = items.filter((item) => item.type === "income");
  const expenseItems = items.filter((item) => item.type === "expense");
  
  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpenses;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (items.length === 0) {
    return (
      <Card className="budget-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Budget Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No budget items yet. Add your income and expenses to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="budget-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">
          Budget Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-budgetBuddy-green bg-opacity-20 text-center">
            <p className="text-sm text-muted-foreground">Total Income</p>
            <p className="text-xl font-bold text-budgetBuddy-green">{formatCurrency(totalIncome)}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-budgetBuddy-red bg-opacity-20 text-center">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-xl font-bold text-budgetBuddy-red">{formatCurrency(totalExpenses)}</p>
          </div>
          
          <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-budgetBuddy-blue bg-opacity-20' : 'bg-budgetBuddy-red bg-opacity-20'} text-center`}>
            <p className="text-sm text-muted-foreground">Net Balance</p>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-budgetBuddy-blue' : 'text-budgetBuddy-red'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
        
        {incomeItems.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Income</h3>
            <ul className="space-y-2">
              {incomeItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                  <span className="font-medium">{item.category}</span>
                  <div className="flex items-center">
                    <span className="text-budgetBuddy-green mr-2">{formatCurrency(item.amount)}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onDeleteItem(item.id)}
                      className="h-7 w-7"
                      aria-label={`Delete ${item.category}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {expenseItems.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Expenses</h3>
            <ul className="space-y-2">
              {expenseItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                  <span className="font-medium">{item.category}</span>
                  <div className="flex items-center">
                    <span className="text-budgetBuddy-red mr-2">{formatCurrency(item.amount)}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onDeleteItem(item.id)}
                      className="h-7 w-7"
                      aria-label={`Delete ${item.category}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
