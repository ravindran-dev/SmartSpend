import React from "react";
import { motion } from "framer-motion";


const data = [];

export default function LineChartCard() {

  const max = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;
  const points = data.length > 0 ? data.map((d, i) => {
    const x = 20 + (i * 80) / (data.length - 1);
    const y = 100 - (d.value / max) * 80;
    return `${x},${y}`;
  }).join(" ") : "";

  return (
    <motion.div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="font-semibold mb-2">Line Chart</h2>
      <svg width={120} height={120} viewBox="0 0 120 120" className="mx-auto">
        {data.length > 0 ? (
          <>
            <polyline points={points} fill="none" stroke="#6366f1" strokeWidth={3} />
            {data.map((d, i) => {
              const x = 20 + (i * 80) / (data.length - 1);
              const y = 100 - (d.value / max) * 80;
              return <circle key={i} cx={x} cy={y} r={4} fill="#6366f1" />;
            })}
          </>
        ) : (
          <text x="60" y="60" textAnchor="middle" fill="#bbb">No data</text>
        )}
      </svg>
      <ul className="mt-2 text-sm">
        {data.length === 0 ? (
          <li className="text-gray-400">No data available.</li>
        ) : (
          data.map((d, i) => (
            <li key={i}>{d.date}: ${d.value}</li>
          ))
        )}
      </ul>
    </motion.div>
  );
}
