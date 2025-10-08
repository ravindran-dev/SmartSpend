import React from "react";
import { UserCircle } from "lucide-react";
import StatusIndicator from "./StatusIndicator";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between h-16 px-6 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        {/* React logo SVG */}
        <svg height="32" width="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="3" fill="#61DAFB"/>
          <g stroke="#61DAFB" strokeWidth="2" fill="none">
            <ellipse rx="10" ry="4.5" cx="16" cy="16"/>
            <ellipse rx="10" ry="4.5" cx="16" cy="16" transform="rotate(60 16 16)"/>
            <ellipse rx="10" ry="4.5" cx="16" cy="16" transform="rotate(120 16 16)"/>
          </g>
        </svg>
        <h1 className="text-xl font-bold tracking-tight">Smart Expense Tracker</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <StatusIndicator />
        <span className="text-gray-600">Hello, User</span>
        <button className="rounded-full p-2 hover:bg-gray-100 transition">
          <UserCircle size={28} />
        </button>
      </div>
    </nav>
  );
}
