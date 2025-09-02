import React from "react";
import { UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between h-16 px-6 bg-white shadow-sm">
      <h1 className="text-xl font-bold tracking-tight">Smart Expense Tracker</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">Hello, User</span>
        <button className="rounded-full p-2 hover:bg-gray-100 transition">
          <UserCircle size={28} />
        </button>
      </div>
    </nav>
  );
}
