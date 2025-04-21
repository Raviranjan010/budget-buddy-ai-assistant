
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BudgetForm, type BudgetItem } from "@/components/BudgetForm";
import { BudgetList } from "@/components/BudgetList";
import { BudgetChart } from "@/components/BudgetChart";
import { ChatBot } from "@/components/ChatBot";
import { PDFExport } from "@/components/PDFExport";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const { toast } = useToast();

  // Load budget items from localStorage on initial load
  useEffect(() => {
    const savedItems = localStorage.getItem("budgetItems");
    if (savedItems) {
      try {
        setBudgetItems(JSON.parse(savedItems));
      } catch (error) {
        console.error("Error loading saved budget items:", error);
        toast({
          title: "Error",
          description: "Failed to load saved budget data.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  // Save budget items to localStorage when they change
  useEffect(() => {
    localStorage.setItem("budgetItems", JSON.stringify(budgetItems));
  }, [budgetItems]);

  const handleAddItem = (item: BudgetItem) => {
    setBudgetItems(prev => [...prev, item]);
  };

  const handleDeleteItem = (id: string) => {
    setBudgetItems(prev => prev.filter(item => item.id !== id));
    toast({
      description: "Budget item deleted",
    });
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all budget items? This cannot be undone.")) {
      setBudgetItems([]);
      toast({
        description: "All budget items cleared",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">Budget Buddy</h1>
            <span className="ml-2 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md text-xs">AI</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <BudgetForm onAddItem={handleAddItem} />
            
            <div className="flex justify-center">
              <PDFExport budgetItems={budgetItems} />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8" id="budget-summary">
            <BudgetList 
              items={budgetItems}
              onDeleteItem={handleDeleteItem}
            />
            
            <BudgetChart items={budgetItems} />
          </div>
        </div>
      </main>

      {/* ChatBot */}
      <ChatBot budgetItems={budgetItems} />
    </div>
  );
};

export default Index;
