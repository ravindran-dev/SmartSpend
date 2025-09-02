import React from "react";
import UploadCard from "./UploadCard";
import ExpenseTable from "./ExpenseTable";
import PieChartCard from "./PieChartCard";
import LineChartCard from "./LineChartCard";
import BudgetProgressCard from "./BudgetProgressCard";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      <UploadCard />
      <ExpenseTable />
      <PieChartCard />
      <LineChartCard />
      <BudgetProgressCard />
    </div>
  );
}
