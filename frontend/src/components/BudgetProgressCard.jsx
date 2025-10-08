import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Target, TrendingUp, AlertTriangle } from "lucide-react";

export default function BudgetProgressCard() {
  const [budget, setBudget] = useState(10000); // Default budget of ₹10,000
  const [spent, setSpent] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [showBudgetSetter, setShowBudgetSetter] = useState(false);
  const [newBudget, setNewBudget] = useState('10000');

  // Calculate current month's expenses
  useEffect(() => {
    fetchExpenses();
    
    // Listen for new expenses
    const handleExpenseAdded = () => {
      fetchExpenses();
    };
    
    window.addEventListener('expenseAdded', handleExpenseAdded);
    return () => window.removeEventListener('expenseAdded', handleExpenseAdded);
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/expenses');
      if (response.ok) {
        const data = await response.json();
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        
        const monthlyExpenses = data.expenses.filter(expense => 
          expense.date.startsWith(currentMonth)
        );
        
        const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        setSpent(totalSpent);
        setExpenses(monthlyExpenses);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const isOverBudget = spent > budget;

  const handleBudgetUpdate = () => {
    const budgetValue = Number(newBudget);
    if (budgetValue > 0) {
      setBudget(budgetValue);
      setShowBudgetSetter(false);
      // Save to localStorage for persistence
      localStorage.setItem('monthlyBudget', budgetValue.toString());
    }
  };

  // Load budget from localStorage on component mount
  useEffect(() => {
    const savedBudget = localStorage.getItem('monthlyBudget');
    if (savedBudget && parseFloat(savedBudget) > 0) {
      const budgetValue = parseFloat(savedBudget);
      setBudget(budgetValue);
      setNewBudget(budgetValue.toString());
    }
  }, []);

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (percent > 80) return 'bg-yellow-500';
    if (percent > 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle size={16} className="text-red-500" />;
    if (percent > 80) return <TrendingUp size={16} className="text-yellow-500" />;
    return <Target size={16} className="text-green-500" />;
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow p-6 flex flex-col gap-4" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header with title and settings */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h2 className="font-semibold">Monthly Budget Utilization</h2>
        </div>
        <button
          onClick={() => {
            setNewBudget(budget.toString());
            setShowBudgetSetter(!showBudgetSetter);
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          title="Set Monthly Budget"
        >
          <Settings size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Budget Setter */}
      {showBudgetSetter && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Set Monthly Budget (₹)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter budget amount"
              min="1"
            />
            <button
              onClick={handleBudgetUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Set
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className={`h-6 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          ></div>
        </div>
        
        {/* Status Text */}
        <div className="flex justify-between text-sm">
          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-700'}`}>
            ₹{spent.toFixed(2)} spent
          </span>
          <span className="text-gray-600">
            ₹{budget.toFixed(2)} budget
          </span>
          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            {percent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        <div className="text-center">
          <p className="text-sm text-gray-600">Remaining</p>
          <p className={`font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{remaining.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Transactions</p>
          <p className="font-semibold text-blue-600">{expenses.length}</p>
        </div>
      </div>

      {/* Warning for over-budget */}
      {isOverBudget && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm font-medium text-red-800">Over Budget!</span>
          </div>
          <p className="text-xs text-red-600 mt-1">
            You've exceeded your monthly budget by ₹{Math.abs(remaining).toFixed(2)}
          </p>
        </div>
      )}

      {/* Progress Status */}
      {!isOverBudget && percent > 80 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Approaching Budget Limit</span>
          </div>
          <p className="text-xs text-yellow-600 mt-1">
            You've used {percent.toFixed(1)}% of your monthly budget
          </p>
        </div>
      )}
    </motion.div>
  );
}
