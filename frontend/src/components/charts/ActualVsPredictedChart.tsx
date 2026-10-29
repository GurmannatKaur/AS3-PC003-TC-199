import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
export interface TrafficDataPoint {
  time: string;
  actual: number;
  predicted: number;
}

interface ActualVsPredictedChartProps {
  data: TrafficDataPoint[];
}

export default function ActualVsPredictedChart({
  data,
}: ActualVsPredictedChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No traffic data available.</p>
      </div>
    );
  }

  return (
    <div
      className="chart-container"
      style={{ width: "100%", height: 320, minWidth: 0 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={45}
          />

          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(148, 163, 184, 0.25)",
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              color: "#ffffff",
            }}
          />

          <Legend />

          <Line
            type="monotone"
            dataKey="actual"
            name="Actual Traffic"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
            connectNulls
          />

          <Line
            type="monotone"
            dataKey="predicted"
            name="Predicted Traffic"
            stroke="#a78bfa"
            strokeWidth={3}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}