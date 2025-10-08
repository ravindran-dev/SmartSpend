import React from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import UploadCard from "./components/UploadCard";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import { useState } from "react";

export default function App() {
  const [page, setPage] = useState("Dashboard");

  let content;
  if (page === "Dashboard") content = <Dashboard />;
  else if (page === "Upload Receipt") content = <UploadCard />;
  else if (page === "Reports") content = <Reports />;
  else if (page === "Settings") content = <Settings />;

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
