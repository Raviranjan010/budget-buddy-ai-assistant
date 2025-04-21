
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetItem } from "./BudgetForm";
import { Chart, registerables } from "chart.js";
import { useIsMobile } from "@/hooks/use-mobile";

Chart.register(...registerables);

type BudgetChartProps = {
  items: BudgetItem[];
};

export function BudgetChart({ items }: BudgetChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (items.length === 0) return;

    // Process data for the chart
    const expenseItems = items.filter((item) => item.type === "expense");
    const incomeItems = items.filter((item) => item.type === "income");

    // Group expense data by category
    const expenseCategories: string[] = [];
    const expenseAmounts: number[] = [];
    const expenseColors: string[] = [];

    // Generate a color palette
    const generateColor = (index: number, total: number) => {
      const hue = (index / total) * 360;
      return `hsl(${hue}, 70%, 60%)`;
    };

    // Group expenses by category
    const groupedExpenses = expenseItems.reduce<Record<string, number>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category] += item.amount;
      return acc;
    }, {});

    // Prepare data for the chart
    Object.entries(groupedExpenses).forEach(([category, amount], index, array) => {
      expenseCategories.push(category);
      expenseAmounts.push(amount);
      expenseColors.push(generateColor(index, array.length));
    });

    // Create the expense chart
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: expenseCategories,
          datasets: [
            {
              data: expenseAmounts,
              backgroundColor: expenseColors,
              borderWidth: 1,
              borderColor: "#ffffff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: isMobile ? "bottom" : "right",
              labels: {
                padding: 15,
                usePointStyle: true,
                font: {
                  size: 12,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw as number;
                  const label = context.label || "";
                  const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(value);
                  return `${label}: ${formatted}`;
                },
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [items, isMobile]);

  if (items.filter(item => item.type === "expense").length === 0) {
    return (
      <Card className="budget-card h-[300px] flex flex-col justify-center items-center animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Expense Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-center text-muted-foreground">
            Add expense items to view the chart
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="budget-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">
          Expense Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
