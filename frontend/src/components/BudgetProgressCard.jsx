import React from "react";
import { motion } from "framer-motion";


const budget = 0;
const spent = 0;
const percent = 0;

export default function BudgetProgressCard() {
  return (
    <motion.div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="font-semibold mb-2">Monthly Budget Utilization</h2>
      <div className="w-full bg-gray-200 rounded-full h-6">
        <div
          className="bg-blue-500 h-6 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-sm mt-1">
        <span>{spent === 0 ? "No data" : `$${spent} spent`}</span>
        <span>{budget === 0 ? "No budget" : `$${budget} budget`}</span>
        <span>{percent}%</span>
      </div>
    </motion.div>
  );
}
