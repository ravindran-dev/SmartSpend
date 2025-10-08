import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Tag, Building, Trash2, RefreshCw } from 'lucide-react';
import { formatDateInfo } from '../utils/dateUtils';

export default function ExpensesList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/expenses');
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
  }, []);

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from local state
        setExpenses(expenses.filter(expense => expense.id !== id));
        
        // Trigger refresh of parent components
        window.dispatchEvent(new CustomEvent('expenseDeleted'));
      } else {
        setError('Failed to delete expense');
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
    }
  };

  const formatCurrency = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${amount?.toFixed(2)}`;
    }
    return `$${amount?.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Expenses</h2>
        <div className="text-center py-8">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p>Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Expenses</h2>
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <button 
            onClick={fetchExpenses}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Expenses</h2>
          <button 
            onClick={fetchExpenses}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="text-center py-8 text-gray-500">
          <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
          <p>No expenses yet</p>
          <p className="text-sm">Upload a bill to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recent Expenses</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{expenses.length} expenses</span>
          <button 
            onClick={fetchExpenses}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {expenses.map((expense) => (
          <div key={expense.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building size={16} className="text-gray-500" />
                  <span className="font-semibold text-gray-800">{expense.vendor}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} className="text-green-600" />
                    <span className="font-bold text-green-600">
                      {formatCurrency(expense.amount, expense.currency)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Tag size={14} className="text-blue-600" />
                    <span className="text-blue-600">{expense.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-500" />
                    {(() => {
                      const dateInfo = formatDateInfo(expense.date);
                      return (
                        <span className={dateInfo.isToday ? 'text-green-600 font-medium' : 'text-gray-600'}>
                          {dateInfo.formatted}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {expense.items && expense.items.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Items: {expense.items.slice(0, 2).join(', ')}
                      {expense.items.length > 2 && ` +${expense.items.length - 2} more`}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => deleteExpense(expense.id)}
                className="ml-4 p-1 text-red-500 hover:bg-red-50 rounded transition"
                title="Delete expense"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total:</span>
          <span className="text-lg font-bold text-green-600">
            ₹{expenses.reduce((total, expense) => {
              return total + (expense.currency === 'INR' ? expense.amount : expense.amount * 80); // Simple conversion
            }, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}