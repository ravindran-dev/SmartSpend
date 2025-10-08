import React, { useState, useEffect } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { formatDateInfo } from '../utils/dateUtils';

export default function ExpenseTable() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [date, setDate] = useState("");

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All Categories') params.append('category', category);
      if (date) params.append('start_date', date);
      
      const response = await fetch(`http://localhost:5000/api/expenses?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setExpenses(data.expenses);
      } else {
        setError('Failed to fetch expenses');
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    
    // Listen for expense changes to refresh data
    const handleExpenseChange = () => {
      setTimeout(fetchExpenses, 500);
    };
    
    window.addEventListener('expenseAdded', handleExpenseChange);
    window.addEventListener('expenseDeleted', handleExpenseChange);
    
    return () => {
      window.removeEventListener('expenseAdded', handleExpenseChange);
      window.removeEventListener('expenseDeleted', handleExpenseChange);
    };
  }, []);

  // Filter expenses based on search and filters
  const filtered = expenses.filter(e =>
    (!search || e.vendor?.toLowerCase().includes(search.toLowerCase())) &&
    (!category || category === 'All Categories' || e.category === category) &&
    (!date || e.date === date)
  );

  const formatCurrency = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${amount?.toFixed(2)}`;
    }
    return `$${amount?.toFixed(2)}`;
  };

  // Get unique categories for filter dropdown
  const categories = ['All Categories', ...new Set(expenses.map(e => e.category))];

  return (
    <motion.div className="bg-white rounded-xl shadow p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Expense History</h3>
        <button 
          onClick={fetchExpenses}
          className="p-2 text-gray-500 hover:text-gray-700"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input 
            className="w-full rounded-lg border px-3 py-2 pl-9 text-sm" 
            placeholder="Search vendor..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          <Search className="absolute left-2 top-2 text-gray-400" size={18} />
        </div>
        <select 
          className="rounded-lg border px-3 py-2 text-sm" 
          value={category} 
          onChange={e => setCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input 
          type="date" 
          className="rounded-lg border px-3 py-2 text-sm" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
        />
        <button 
          className="rounded-lg px-3 py-2 bg-blue-50 text-blue-700 flex items-center gap-1"
          onClick={fetchExpenses}
        >
          <Filter size={16} />Filter
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-2 text-left">Vendor</th>
              <th className="py-2 text-left">Amount</th>
              <th className="py-2 text-left">Category</th>
              <th className="py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="animate-spin mr-2" size={16} />
                    Loading expenses...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-red-500">
                  <div>
                    <p>{error}</p>
                    <button 
                      onClick={fetchExpenses}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  {expenses.length === 0 ? 'No expenses found.' : 'No expenses match your filters.'}
                </td>
              </tr>
            ) : (
              filtered.map((expense) => (
                <tr key={expense.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{expense.vendor}</td>
                  <td className="py-3 text-green-600 font-semibold">
                    {formatCurrency(expense.amount, expense.currency)}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">
                    {(() => {
                      const dateInfo = formatDateInfo(expense.date);
                      return (
                        <span className={dateInfo.isToday ? 'text-green-600 font-medium' : ''}>
                          {dateInfo.formatted}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {filtered.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filtered.length} of {expenses.length} expenses
        </div>
      )}
    </motion.div>
  );
}
