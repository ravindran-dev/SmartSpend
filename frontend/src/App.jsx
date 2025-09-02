import React from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import { useState } from "react";

export default function App() {
  const [page, setPage] = useState("Dashboard");

  let content;
  if (page === "Dashboard") content = <Dashboard />;
  else if (page === "Reports") content = <Reports />;
  else if (page === "Settings") content = <Settings />;
  else if (page === "Upload Receipt") content = <div className="bg-white rounded-xl shadow p-6">Upload Receipt page coming soon.</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar setPage={setPage} activePage={page} />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">
          {content}
        </main>
      </div>
    </div>
  );
}
