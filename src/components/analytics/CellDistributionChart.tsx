import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { SummaryStats } from "./types";

type CellDistributionChartProps = {
  summaryStats: SummaryStats;
};

const CellDistributionChart = ({ summaryStats }: CellDistributionChartProps) => {
  return (
    <div className="chart-card-dark">
      <h3>Cell Voltage Distribution</h3>
      <div className="chart-container bar-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={summaryStats.cellVoltageData}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="cell"
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
              axisLine={false}
              tickLine={false}
              domain={[3.6, 4.3]}
            />
            <Tooltip
              contentStyle={{
                background: "#000D08",
                border: "1px solid #143628",
                borderRadius: "0.75rem",
                color: "white",
              }}
            />
            <Bar dataKey="voltage" fill="#4ade80" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CellDistributionChart;
