import { useEffect, useMemo, useState } from "react";
import {
  getDeviceBoardLatest,
  getDeviceBoards,
  getDevices,
  type DeviceLatest,
  type DeviceListItem,
} from "../services/deviceService";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [latest, setLatest] = useState<DeviceLatest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const list = await getDevices();
        setDevices(list);
        if (list.length > 0) {
          const boardList = await getDeviceBoards(list[0].d_id);
          const boardsWithData = boardList.filter((board) => (board.totalRecords ?? 0) > 0);
          const masterBoard = boardsWithData.find((board) => board.daddr === 0);
          const boardDaddr =
            masterBoard?.daddr ?? boardsWithData[0]?.daddr ?? boardList[0]?.daddr ?? 0;
          const snapshot = await getDeviceBoardLatest(list[0].d_id, boardDaddr);
          setLatest(snapshot);
        }
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const avgTemp = useMemo(() => {
    if (!latest) return 0;
    return (latest.t1 + latest.t2 + latest.t3 + latest.t4) / 4;
  }, [latest]);

  const lastUpdated = latest?.received_at
    ? new Date(latest.received_at).toLocaleString()
    : "--";

  return (
    <div className="dashboard-page">
      <h2 className="dashboard-title">Dashboard</h2>
      {error && <p className="error">{error}</p>}
      {loading && <p className="dashboard-loading">Loading dashboard data...</p>}
      <div className="kpi-grid">
        <div className="kpi-card">
          <p>Temperature</p>
          <h1>{avgTemp.toFixed(1)}°C</h1>
          <span>
            T1:{latest?.t1 ?? 0} T2:{latest?.t2 ?? 0} T3:{latest?.t3 ?? 0} T4:{latest?.t4 ?? 0} DT1:{latest?.dt1 ?? 0} DT2:{latest?.dt2 ?? 0}
          </span>
        </div>
        <div className="kpi-card">
          <p>Voltage</p>
          <h1>{latest?.pack_voltage ?? 0}V</h1>
          <span>
            {Array.from({ length: 16 }, (_, i) => `C${i + 1}:${latest?.[`c${i + 1}` as keyof DeviceLatest] ?? 0}`)
              .join(" | ")}
          </span>
        </div>
        <div className="kpi-card">
          <p>Current</p>
          <h1>{latest?.pack_current ?? 0}A</h1>
          <span>Last updated: {lastUpdated}</span>
        </div>
        <div className="kpi-card">
          <p>Status</p>
          <h1>{latest?.capacity ?? 0}%</h1>
          <span>
            Balancing: {String(latest?.bals ?? "--")} • DAddr: {latest?.daddr ?? 0} • Devices: {devices.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
