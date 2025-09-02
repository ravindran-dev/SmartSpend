import React from "react";
import { motion } from "framer-motion";


const data = [];

function getPieSegments(data) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = 0;
  return data.map((d) => {
    const angle = (d.value / total) * 360;
    const segment = {
      ...d,
      startAngle,
      endAngle: startAngle + angle,
    };
    startAngle += angle;
    return segment;
  });
}

export default function PieChartCard() {
  const segments = getPieSegments(data);
  return (
    <motion.div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="font-semibold mb-2">Pie Chart</h2>
      <svg width={120} height={120} viewBox="0 0 120 120" className="mx-auto">
        {segments.length > 0 ? (
          segments.map((seg, i) => {
            const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;
            const r = 50;
            const cx = 60, cy = 60;
            const start = [
              cx + r * Math.cos((Math.PI * seg.startAngle) / 180),
              cy + r * Math.sin((Math.PI * seg.startAngle) / 180),
            ];
            const end = [
              cx + r * Math.cos((Math.PI * seg.endAngle) / 180),
              cy + r * Math.sin((Math.PI * seg.endAngle) / 180),
            ];
            return (
              <path
                key={i}
                d={`M${cx},${cy} L${start[0]},${start[1]} A${r},${r} 0 ${largeArc},1 ${end[0]},${end[1]} Z`}
                fill={seg.color}
                opacity={0.9}
              />
            );
          })
        ) : (
          <text x="60" y="60" textAnchor="middle" fill="#bbb">No data</text>
        )}
      </svg>
      <ul className="mt-2 text-sm">
        {data.length === 0 ? (
          <li className="text-gray-400">No data available.</li>
        ) : (
          data.map((d, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: d.color }}></span>
              {d.category}: ${d.value}
            </li>
          ))
        )}
      </ul>
    </motion.div>
  );
}
