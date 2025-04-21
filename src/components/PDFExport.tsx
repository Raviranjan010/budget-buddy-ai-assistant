
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BudgetItem } from "./BudgetForm";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type PDFExportProps = {
  budgetItems: BudgetItem[];
};

export function PDFExport({ budgetItems }: PDFExportProps) {
  const { toast } = useToast();

  const generatePDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      toast({
        title: "Generating PDF",
        description: "Please wait while we create your budget report...",
      });

      // Get element that contains the budget data
      const budgetElement = document.getElementById("budget-summary");
      
      if (!budgetElement) {
        throw new Error("Could not find budget summary element");
      }
      
      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      
      // Set title
      pdf.setFontSize(20);
      pdf.text("Budget Summary Report", pageWidth / 2, 20, { align: "center" });
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: "center" });
      
      // Draw line
      pdf.setLineWidth(0.5);
      pdf.line(margin, 35, pageWidth - margin, 35);
      
      let yPos = 45;
      
      // Add budget summary
      const incomeItems = budgetItems.filter(item => item.type === "income");
      const expenseItems = budgetItems.filter(item => item.type === "expense");
      
      const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
      const balance = totalIncome - totalExpenses;
      
      pdf.setFontSize(16);
      pdf.text("Budget Overview", margin, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Total Income: $${totalIncome.toFixed(2)}`, margin, yPos);
      yPos += 7;
      
      pdf.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, margin, yPos);
      yPos += 7;
      
      pdf.text(`Net Balance: $${balance.toFixed(2)}`, margin, yPos);
      yPos += 15;
      
      // Add income breakdown
      if (incomeItems.length > 0) {
        pdf.setFontSize(16);
        pdf.text("Income Breakdown", margin, yPos);
        yPos += 10;
        
        pdf.setFontSize(12);
        incomeItems.forEach(item => {
          pdf.text(`${item.category}: $${item.amount.toFixed(2)}`, margin, yPos);
          yPos += 7;
          
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
        });
        
        yPos += 5;
      }
      
      // Add expense breakdown
      if (expenseItems.length > 0) {
        pdf.setFontSize(16);
        pdf.text("Expense Breakdown", margin, yPos);
        yPos += 10;
        
        pdf.setFontSize(12);
        expenseItems.forEach(item => {
          pdf.text(`${item.category}: $${item.amount.toFixed(2)}`, margin, yPos);
          yPos += 7;
          
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
        });
      }
      
      // Try to add chart if there are expenses
      if (expenseItems.length > 0) {
        try {
          const chartElement = document.querySelector("canvas");
          if (chartElement) {
            pdf.addPage();
            const canvas = await html2canvas(chartElement);
            const imgData = canvas.toDataURL("image/png");
            
            pdf.setFontSize(16);
            pdf.text("Expense Distribution", pageWidth / 2, 20, { align: "center" });
            
            // Add chart image
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", margin, 30, imgWidth, imgHeight);
          }
        } catch (error) {
          console.error("Error adding chart to PDF:", error);
        }
      }
      
      // Add suggestions or tips
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("Budget Insights & Recommendations", pageWidth / 2, 20, { align: "center" });
      
      pdf.setFontSize(12);
      yPos = 35;
      
      const insights = [
        balance >= 0 
          ? "You're on track with your budget! Keep up the good work."
          : "Your expenses currently exceed your income. Consider reducing non-essential spending.",
          
        totalExpenses > 0
          ? `Your largest expense category is ${expenseItems.sort((a, b) => b.amount - a.amount)[0]?.category || "N/A"}.`
          : "Add some expense items to get more detailed insights.",
          
        "Recommendation: Aim to save at least 20% of your income for future goals.",
        
        totalIncome > 0 && totalExpenses > 0
          ? `Your current savings rate is ${((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)}% of your income.`
          : "Add both income and expenses to calculate your savings rate.",
          
        "Set specific financial goals and track your progress regularly."
      ];
      
      insights.forEach(insight => {
        pdf.text(`• ${insight}`, margin, yPos);
        yPos += 10;
      });
      
      // Save PDF
      pdf.save("budget-summary.pdf");
      
      toast({
        title: "PDF Generated",
        description: "Your budget report has been downloaded successfully!",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={generatePDF}
      className="budget-btn budget-btn-secondary"
      disabled={budgetItems.length === 0}
    >
      <Download className="mr-2 h-4 w-4" /> Export Report
    </Button>
  );
}
