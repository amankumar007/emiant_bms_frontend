import { useEffect, useMemo, useState } from "react";
import {
  getDeviceBoardLatest,
  getDeviceBoards,
  getDevices,
  type DeviceBoard,
  type DeviceListItem,
} from "../services/deviceService";
import { useNavigate, useParams } from "react-router-dom";
import AnalyticsHeader from "../components/analytics/AnalyticsHeader";
import SummaryCards from "../components/analytics/SummaryCards";
import ModeTabs from "../components/analytics/ModeTabs";
import TelemetryChart from "../components/analytics/TelemetryChart";
import CellDistributionChart from "../components/analytics/CellDistributionChart";
import {
  formatChartTime,
  getCellsFromTelemetry,
  getTempsFromTelemetry,
  getTelemetryTimestampMs,
} from "../components/analytics/analyticsUtils";
import type {
  AnalyticsMode,
  AnalyticsPoint,
  ChartRow,
  Snapshot,
  SummaryStats,
} from "../components/analytics/types";
import "../styles/analytics.css";

const LIVE_WINDOW_MS = 5 * 60 * 1000;

const Analytics = () => {
  const navigate = useNavigate();
  const { device_id: routeDeviceId } = useParams();
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [boards, setBoards] = useState<DeviceBoard[]>([]);
  const [selectedBoardDaddr, setSelectedBoardDaddr] = useState<number | null>(null);
  const [data, setData] = useState<AnalyticsPoint[]>([]);
  const [latestSnapshot, setLatestSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AnalyticsMode>("cells");

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const list = await getDevices();
        setError("");
        setDevices(list);
        if (list.length > 0) {
          const routeMatch = routeDeviceId
            ? list.find((device) => device.d_id === routeDeviceId)
            : null;
          if (routeMatch) {
            setSelectedDeviceId(routeMatch.d_id);
          } else {
            setSelectedDeviceId((prev) => prev ?? list[0].d_id);
          }
        }
      } catch (err) {
        setError("Failed to fetch devices");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [routeDeviceId]);

  useEffect(() => {
    if (!routeDeviceId || devices.length === 0) return;
    const exists = devices.some(
      (device) => device.d_id === routeDeviceId
    );
    if (exists) {
      setSelectedDeviceId(routeDeviceId);
    }
  }, [devices, routeDeviceId]);

  useEffect(() => {
    if (!selectedDeviceId) return;

    const fetchBoards = async () => {
      try {
        const list = await getDeviceBoards(selectedDeviceId);
        setBoards(list);
        const master = list.find((board) => board.daddr === 0);
        setSelectedBoardDaddr(master?.daddr ?? list[0]?.daddr ?? null);
        setError("");
      } catch (err) {
        setBoards([]);
        setSelectedBoardDaddr(null);
        setError("Failed to fetch boards");
        console.error(err);
      }
    };

    setData([]);
    setLatestSnapshot(null);
    fetchBoards();
  }, [selectedDeviceId]);

  useEffect(() => {
    if (!selectedDeviceId || selectedBoardDaddr === null) return;

    setData([]);
    setLatestSnapshot(null);

    const fetchSnapshot = async () => {
      try {
        const snapshot = await getDeviceBoardLatest(selectedDeviceId, selectedBoardDaddr);
        setError("");
        setLatestSnapshot(snapshot);
        const cells = getCellsFromTelemetry(snapshot);
        const temps = getTempsFromTelemetry(snapshot);
        setData((prev) => {
          const timestampMs = getTelemetryTimestampMs(snapshot);
          const nextPoint: AnalyticsPoint = {
            time: formatChartTime(timestampMs),
            timestampMs,
            cells,
            current: Number(snapshot.pack_current ?? 0),
            temps,
            packVoltage: snapshot.pack_voltage,
            soc: Number(snapshot.capacity ?? 0),
          };
          const cutoffMs = nextPoint.timestampMs - LIVE_WINDOW_MS;

          const lastPoint = prev[prev.length - 1];
          if (lastPoint && lastPoint.timestampMs === nextPoint.timestampMs) {
            const updated = [...prev];
            updated[updated.length - 1] = nextPoint;
            return updated.filter((point) => point.timestampMs >= cutoffMs);
          }

          if (lastPoint && nextPoint.timestampMs < lastPoint.timestampMs) {
            return [...prev, nextPoint]
              .sort((a, b) => a.timestampMs - b.timestampMs)
              .filter((point) => point.timestampMs >= cutoffMs);
          }

          return [...prev, nextPoint].filter((point) => point.timestampMs >= cutoffMs);
        });
      } catch (err) {
        setLatestSnapshot(null);
        setData([]);
        const status = (err as { response?: { status?: number } })?.response?.status;
        setError(
          status === 404
            ? `No analytics data for ${selectedBoardDaddr === 0 ? "master" : "slave"} board`
            : "Failed to fetch snapshot"
        );
        console.error(err);
      }
    };

    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, 3000);

    return () => clearInterval(interval);
  }, [selectedBoardDaddr, selectedDeviceId]);

  useEffect(() => {
    if (selectedDeviceId) {
      navigate(`/analytics/${selectedDeviceId}`, { replace: true });
    }
  }, [navigate, selectedDeviceId]);

  const summaryStats = useMemo(() => {
    if (!latestSnapshot) {
      return null;
    }
    const cellVoltages = getCellsFromTelemetry(latestSnapshot);
    const temperatures = getTempsFromTelemetry(latestSnapshot);
    const cellMax = Math.max(...cellVoltages);
    const cellMin = Math.min(...cellVoltages);
    const maxTemp = Math.max(...temperatures);
    const imbalance = cellMax - cellMin;
    
    // Build individual cell voltage data for bar chart
    const cellVoltageData = cellVoltages.map((voltage, index) => ({
      cell: `C${index + 1}`,
      voltage: parseFloat(voltage.toFixed(3)),
    }));

    return {
      cellMax,
      cellMin,
      maxTemp,
      imbalance,
      cellVoltageData,
    } as SummaryStats;
  }, [latestSnapshot]);

  const chartData = useMemo(() => {
    return data.map((d) => {
      const row: ChartRow = { time: d.time };

      if (mode === "cells") {
        d.cells.forEach((v, i) => (row[`cell${i + 1}`] = v));
      }

      if (mode === "currents") {
        row.current = d.current;
      }

      if (mode === "temps") {
        d.temps.forEach((v, i) => (row[`temp${i + 1}`] = v));
      }

      return row;
    });
  }, [data, mode]);

  return (
    <>
      <AnalyticsHeader
        selectedDeviceId={selectedDeviceId}
        selectedBoardId={selectedBoardDaddr}
        latestSnapshot={latestSnapshot}
        devices={devices}
        boards={boards}
        onSelectDevice={setSelectedDeviceId}
        onSelectBoard={setSelectedBoardDaddr}
      />

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading devices...</p>}

      {latestSnapshot && summaryStats && (
        <SummaryCards latestSnapshot={latestSnapshot} summaryStats={summaryStats} />
      )}

      <ModeTabs mode={mode} onModeChange={setMode} />

      <TelemetryChart mode={mode} chartData={chartData} summaryStats={summaryStats} />

      {summaryStats && <CellDistributionChart summaryStats={summaryStats} />}
    </>
  );
};

export default Analytics;

