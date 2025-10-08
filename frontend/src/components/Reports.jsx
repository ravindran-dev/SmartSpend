import React, { useState, useEffect } from "react";

export default function Reports() {
  const [month, setMonth] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  // Fetch expenses data on component mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filter expenses when month changes
  useEffect(() => {
    if (month) {
      const filtered = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const selectedMonth = new Date(month + "-01");
        return expenseDate.getFullYear() === selectedMonth.getFullYear() &&
               expenseDate.getMonth() === selectedMonth.getMonth();
      });
      setFilteredExpenses(filtered);
    } else {
      setFilteredExpenses(expenses);
    }
  }, [month, expenses]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/expenses");
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
        setFilteredExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (filteredExpenses.length === 0) {
      alert("No expenses found for the selected period");
      return;
    }

    const headers = ["Date", "Vendor", "Category", "Amount", "Currency"];
    const csvContent = [
      headers.join(","),
      ...filteredExpenses.map(expense => [
        expense.date,
        `"${expense.vendor || 'Unknown'}"`,
        expense.category,
        expense.amount,
        expense.currency || 'INR'
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${month || 'all'}.csv`;
    link.click();
  };

  const downloadPDF = () => {
    if (filteredExpenses.length === 0) {
      alert("No expenses found for the selected period");
      return;
    }

    // Simple PDF generation using window.print
    const printWindow = window.open('', '_blank');
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Expense Report - ${month || 'All Time'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .total { font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SmartSpend Expense Report</h1>
            <h2>${month || 'All Time'}</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              ${filteredExpenses.map(expense => `
                <tr>
                  <td>${expense.date}</td>
                  <td>${expense.vendor || 'Unknown'}</td>
                  <td>${expense.category}</td>
                  <td>${expense.amount.toFixed(2)}</td>
                  <td>${expense.currency || 'INR'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total: ${totalAmount.toFixed(2)} ${filteredExpenses[0]?.currency || 'INR'}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Download Monthly Expenses</h2>
      
      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <input 
          type="month" 
          value={month} 
          onChange={e => setMonth(e.target.value)} 
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Select month"
        />
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition-colors" 
          onClick={downloadCSV}
          disabled={loading}
        >
          Download CSV
        </button>
        <button 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow transition-colors" 
          onClick={downloadPDF}
          disabled={loading}
        >
          Download PDF
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Expenses</h3>
          <p className="text-2xl font-bold text-blue-900">{filteredExpenses.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Total Amount</h3>
          <p className="text-2xl font-bold text-green-900">
            ₹{filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">Period</h3>
          <p className="text-2xl font-bold text-purple-900">{month || 'All Time'}</p>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading expenses...</p>
        </div>
      ) : filteredExpenses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.vendor || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No expenses found for the selected period</p>
          <p className="text-sm text-gray-400 mt-2">Try selecting a different month or upload some receipts first</p>
        </div>
      )}
    </div>
  );
}
