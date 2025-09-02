import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";


const sampleExpenses = [];

export default function ExpenseTable() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  // TODO: Add pagination and backend API integration
  const filtered = sampleExpenses.filter(e =>
    (!search || e.item?.toLowerCase().includes(search.toLowerCase())) &&
    (!category || e.category === category) &&
    (!date || e.date === date)
  );

  return (
    <motion.div className="bg-white rounded-xl shadow p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input className="w-full rounded-lg border px-3 py-2 pl-9 text-sm" placeholder="Search item..." value={search} onChange={e => setSearch(e.target.value)} />
          <Search className="absolute left-2 top-2 text-gray-400" size={18} />
        </div>
        <select className="rounded-lg border px-3 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Entertainment">Entertainment</option>
        </select>
        <input type="date" className="rounded-lg border px-3 py-2 text-sm" value={date} onChange={e => setDate(e.target.value)} />
        <button className="rounded-lg px-3 py-2 bg-blue-50 text-blue-700 flex items-center gap-1"><Filter size={16} />Filter</button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500">
            <th className="py-2 text-left">Item</th>
            <th className="py-2 text-left">Amount</th>
            <th className="py-2 text-left">Category</th>
            <th className="py-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-400">No expenses found.</td>
            </tr>
          ) : (
            filtered.map((e, i) => (
              <tr key={i} className="border-b last:border-none">
                <td className="py-2">{e.item}</td>
                <td className="py-2">${e.amount?.toFixed(2)}</td>
                <td className="py-2">{e.category}</td>
                <td className="py-2">{e.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* TODO: Pagination */}
    </motion.div>
  );
}
