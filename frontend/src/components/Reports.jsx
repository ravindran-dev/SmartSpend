import React, { useState } from "react";

export default function Reports() {
  const [month, setMonth] = useState("");

  // Placeholder for expenses data
  const expenses = [];

  const handleDownload = (type) => {
    // TODO: Filter expenses by month and export as CSV or PDF
    alert(`Download ${type} for ${month || "selected month"}`);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold mb-4">Download Monthly Expenses</h2>
      <div className="flex gap-4 mb-4">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="border rounded px-3 py-2" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded shadow" onClick={() => handleDownload("CSV")}>Download CSV</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded shadow" onClick={() => handleDownload("PDF")}>Download PDF</button>
      </div>
      {/* TODO: Show filtered expenses table here */}
    </div>
  );
}
