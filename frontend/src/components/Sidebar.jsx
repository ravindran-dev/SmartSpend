import React from "react";
import { Home, Upload, BarChart2, Settings } from "lucide-react";


const menu = [
  { name: "Dashboard", icon: <Home size={20} /> },
  { name: "Upload Receipt", icon: <Upload size={20} /> },
  { name: "Reports", icon: <BarChart2 size={20} /> },
  { name: "Settings", icon: <Settings size={20} /> },
];

export default function Sidebar({ setPage, activePage }) {
  return (
    <aside className="w-64 bg-white shadow-md h-full flex flex-col py-6">
      <div className="px-6 mb-8">
        <span className="text-2xl font-bold text-gray-800">EXPENSE<br />TRACKER</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {menu.map((item) => (
            <li key={item.name}>
              <button
                className={`flex items-center gap-3 px-6 py-2 w-full text-left rounded-lg transition hover:bg-gray-100 ${activePage === item.name ? "bg-gray-100 font-semibold" : "text-gray-700"}`}
                onClick={() => setPage(item.name)}
              >
                {item.icon}
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
