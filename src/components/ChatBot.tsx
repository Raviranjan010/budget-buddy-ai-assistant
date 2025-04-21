
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Plus, Send, X } from "lucide-react";
import { BudgetItem } from "./BudgetForm";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

type ChatBotProps = {
  budgetItems: BudgetItem[];
};

export function ChatBot({ budgetItems }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      text: "Hello! I'm your Budget Buddy AI assistant. I can help you analyze your budget, suggest improvements, and answer your financial questions. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const generateResponse = async (userInput: string) => {
    setIsLoading(true);
    
    try {
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll generate responses based on keywords
      let response = "";
      const userInputLower = userInput.toLowerCase();
      
      // Calculate total income, expenses and balance
      const income = budgetItems
        .filter(item => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);
      
      const expenses = budgetItems
        .filter(item => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);
      
      const balance = income - expenses;
      const formattedIncome = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(income);
      const formattedExpenses = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expenses);
      const formattedBalance = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance);
      
      // Group expenses by category
      const expensesByCategory = budgetItems
        .filter(item => item.type === "expense")
        .reduce<Record<string, number>>((acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = 0;
          }
          acc[item.category] += item.amount;
          return acc;
        }, {});
      
      // Sort expenses by amount (highest first)
      const sortedExpenses = Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1]);
      
      if (userInputLower.includes("summary") || userInputLower.includes("overview")) {
        response = `Here's your budget summary:
        
Total Income: ${formattedIncome}
Total Expenses: ${formattedExpenses}
Current Balance: ${formattedBalance}

${balance >= 0 
  ? "You're currently on track with your budget! 👍" 
  : "You're currently spending more than your income. Consider reducing some expenses. 💭"}`;
      } 
      else if (userInputLower.includes("expense") || userInputLower.includes("spending")) {
        if (sortedExpenses.length === 0) {
          response = "You haven't added any expenses yet. Add some expense items to get insights!";
        } else {
          const topExpenses = sortedExpenses.slice(0, 3);
          const expensesBreakdown = topExpenses.map(([category, amount], index) => {
            const percentage = (amount / expenses * 100).toFixed(1);
            return `${index + 1}. ${category}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)} (${percentage}% of total)`;
          }).join('\n');
          
          response = `Here's a breakdown of your top expenses:

${expensesBreakdown}

${topExpenses[0] ? `Your highest expense category is "${topExpenses[0][0]}" at ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(topExpenses[0][1])}.` : ''}

${expenses > income * 0.8 
  ? "Your expenses are quite high relative to your income. Consider ways to reduce spending in your top categories." 
  : "Your expense distribution looks reasonable. Keep up the good work!"}`;
        }
      }
      else if (userInputLower.includes("save") || userInputLower.includes("saving")) {
        if (balance <= 0) {
          response = `Currently your expenses (${formattedExpenses}) exceed your income (${formattedIncome}). To start saving, you'll need to either increase your income or reduce expenses.
          
Here are some suggestions:
1. Look for areas to cut back, especially in your highest spending categories
2. Consider a side hustle or additional income source
3. Set a specific savings goal to stay motivated`;
        } else {
          const savingsRate = (balance / income * 100).toFixed(1);
          response = `Great! You're currently saving ${formattedBalance} per month, which is about ${savingsRate}% of your income.
          
Financial experts often recommend saving at least 20% of your income. ${parseFloat(savingsRate) >= 20 
  ? "You're on track with this recommendation! 🎉" 
  : "Consider increasing your savings if possible."}

Some ways to boost your savings:
1. Automate transfers to a savings account
2. Look for additional areas to reduce expenses
3. Set specific financial goals`;
        }
      }
      else if (userInputLower.includes("tip") || userInputLower.includes("advice") || userInputLower.includes("help")) {
        const tips = [
          "Track all your expenses, even small ones. They add up quickly!",
          "Use the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
          "Build an emergency fund covering 3-6 months of expenses.",
          "Pay yourself first by automating transfers to savings accounts.",
          "Review subscriptions regularly and cancel unused ones.",
          "Wait 24 hours before making non-essential purchases to avoid impulse buying.",
          "Compare prices before making significant purchases.",
          "Cook at home more often to reduce food expenses.",
          "Use cashback credit cards for everyday purchases (but pay them off fully).",
          "Set specific, measurable financial goals with deadlines."
        ];
        
        // Select random tips
        const randomTips = tips
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        
        response = `Here are some budgeting tips that might help:

1. ${randomTips[0]}
2. ${randomTips[1]}
3. ${randomTips[2]}

Would you like more specific advice about a particular area of your budget?`;
      }
      else {
        response = "I'm not sure how to help with that specific question. You can ask me about your budget summary, expense breakdown, saving tips, or general financial advice!";
      }
      
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: response,
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    await generateResponse(userMessage.text);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      {isOpen ? (
        <Card className="fixed bottom-4 right-4 w-[90%] sm:w-[400px] h-[500px] flex flex-col shadow-lg animate-slide-in z-50 budget-card">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Budget Buddy AI
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleChat}
                className="h-8 w-8"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="whitespace-pre-line">{message.text}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.sender === "user"
                          ? "text-primary-foreground text-opacity-80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="border-t p-2">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Ask me anything about your budget..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !inputValue.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg animate-pulse z-50"
          size="icon"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}
