import { useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { ChartRow, AnalyticsMode, SummaryStats } from "./types";

type TelemetryChartProps = {
  mode: AnalyticsMode;
  chartData: ChartRow[];
  summaryStats: SummaryStats | null;
};

type SeriesMeta = {
  key: string;
  label: string;
  color: string;
  unit: string;
  precision: number;
};

const MAX_CELL_COUNT = 16;
const MAX_ZOOM_LEVEL = 8;
const MIN_ZOOMED_POINTS = 8;

const TelemetryChart = ({ mode, chartData, summaryStats }: TelemetryChartProps) => {
  const chartCardRef = useRef<HTMLDivElement>(null);
  const chartPlotRef = useRef<HTMLDivElement>(null);

  const [disabledSeriesByMode, setDisabledSeriesByMode] = useState<Record<AnalyticsMode, string[]>>({
    cells: [],
    currents: [],
    temps: [],
  });
  const [zoomByMode, setZoomByMode] = useState<Record<AnalyticsMode, number>>({
    cells: 1,
    currents: 1,
    temps: 1,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const zoomLevel = zoomByMode[mode] ?? 1;

  const modeSeries = useMemo<SeriesMeta[]>(() => {
    if (mode === "cells") {
      return Array.from({ length: MAX_CELL_COUNT }, (_, index) => ({
        key: `cell${index + 1}`,
        label: `${index + 1}`,
        color: `hsl(${index * 20}, 70%, 55%)`,
        unit: "V",
        precision: 3,
      }));
    }

    if (mode === "currents") {
      return [
        {
          key: "current",
          label: "Pack Current",
          color: "#22d3ee",
          unit: "A",
          precision: 2,
        },
      ];
    }

    const detectedTempKeys = Array.from(
      new Set(
        chartData.flatMap((point) =>
          Object.keys(point).filter((key) => key.startsWith("temp"))
        )
      )
    ).sort((a, b) => {
      const aIndex = Number(a.replace("temp", ""));
      const bIndex = Number(b.replace("temp", ""));
      return aIndex - bIndex;
    });

    return detectedTempKeys.map((key, index) => ({
      key,
      label: `Temp ${index + 1}`,
      color: `hsl(${12 + index * 34}, 84%, 62%)`,
          unit: "C",
      precision: 1,
    }));
  }, [chartData, mode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === chartCardRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const disabledSeries = useMemo(
    () => disabledSeriesByMode[mode] ?? [],
    [disabledSeriesByMode, mode]
  );

  const visibleSeries = useMemo(
    () => modeSeries.filter((series) => !disabledSeries.includes(series.key)),
    [disabledSeries, modeSeries]
  );

  const visibleData = useMemo(() => {
    if (chartData.length === 0 || zoomLevel <= 1) {
      return chartData;
    }

    const windowSize = Math.max(MIN_ZOOMED_POINTS, Math.floor(chartData.length / zoomLevel));
    const startIndex = Math.max(0, chartData.length - windowSize);
    return chartData.slice(startIndex);
  }, [chartData, zoomLevel]);

  const yAxisDomain: [number, number] | ["auto", "auto"] =
    mode === "cells" ? [3, 4.3] : mode === "temps" ? [20, 50] : ["auto", "auto"];

  const toggleSeries = (key: string) => {
    setDisabledSeriesByMode((prev) => {
      const current = prev[mode] ?? [];
      const next = current.includes(key)
        ? current.filter((seriesKey) => seriesKey !== key)
        : [...current, key];
      return { ...prev, [mode]: next };
    });
  };

  const toggleAllSeries = (enabled: boolean) => {
    setDisabledSeriesByMode((prev) => ({
      ...prev,
      [mode]: enabled ? [] : modeSeries.map((series) => series.key),
    }));
  };

  const zoomIn = () => {
    setZoomByMode((prev) => ({
      ...prev,
      [mode]: Math.min(MAX_ZOOM_LEVEL, (prev[mode] ?? 1) + 1),
    }));
  };

  const zoomOut = () => {
    setZoomByMode((prev) => ({
      ...prev,
      [mode]: Math.max(1, (prev[mode] ?? 1) - 1),
    }));
  };

  const resetZoom = () => {
    setZoomByMode((prev) => ({ ...prev, [mode]: 1 }));
  };

  const toggleFullscreen = () => {
    if (!chartCardRef.current) {
      return;
    }

    if (document.fullscreenElement === chartCardRef.current) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }

    chartCardRef.current.requestFullscreen().catch(() => undefined);
  };

  const downloadSnapshot = () => {
    const svg = chartPlotRef.current?.querySelector("svg");
    if (!svg) {
      return;
    }

    const bounds = svg.getBoundingClientRect();
    const serializer = new XMLSerializer();
    let svgMarkup = serializer.serializeToString(svg);
    if (!svgMarkup.includes("xmlns=\"http://www.w3.org/2000/svg\"")) {
      svgMarkup = svgMarkup.replace("<svg", "<svg xmlns=\"http://www.w3.org/2000/svg\"");
    }

    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(bounds.width * scale));
      canvas.height = Math.max(1, Math.floor(bounds.height * scale));
      const context = canvas.getContext("2d");

      if (context) {
        context.scale(scale, scale);
        context.fillStyle = "#001d15";
        context.fillRect(0, 0, bounds.width, bounds.height);
        context.drawImage(image, 0, 0, bounds.width, bounds.height);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `telemetry-${mode}-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
        link.click();
      }

      URL.revokeObjectURL(blobUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(blobUrl);
    };

    image.src = blobUrl;
  };

  return (
    <div className="chart-card-dark" ref={chartCardRef}>
      <div className="chart-header">
        <div>
          <h3>
            {mode === "cells"
              ? "Cell Voltages (V)"
              : mode === "currents"
                ? "Pack Current (A)"
                : "Temperatures (°C)"}
          </h3>
          {mode === "cells" && summaryStats && (
            <div className="cell-metrics">
              <span>Max: {summaryStats.cellMax.toFixed(3)} V</span>
              <span>Min: {summaryStats.cellMin.toFixed(3)} V</span>
              <span>Difference: {summaryStats.imbalance.toFixed(3)} V</span>
            </div>
          )}
        </div>

        <div className="chart-tools">
          <button type="button" className="chart-tool-btn" onClick={downloadSnapshot}>
            Snapshot
          </button>
          <button type="button" className="chart-tool-btn" onClick={zoomIn} disabled={zoomLevel >= MAX_ZOOM_LEVEL}>
            Zoom In
          </button>
          <button type="button" className="chart-tool-btn" onClick={zoomOut} disabled={zoomLevel <= 1}>
            Zoom Out
          </button>
          <button type="button" className="chart-tool-btn" onClick={resetZoom} disabled={zoomLevel === 1}>
            Reset Zoom
          </button>
          <button type="button" className="chart-tool-btn" onClick={toggleFullscreen}>
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      {modeSeries.length > 0 && (
        <div className="series-toggle-panel">
          <div className="toggle-header-row">
            <p>Channel Toggles</p>
            <div className="toggle-actions">
              <button type="button" className="toggle-action-btn" onClick={() => toggleAllSeries(true)}>
                All On
              </button>
              <button type="button" className="toggle-action-btn" onClick={() => toggleAllSeries(false)}>
                All Off
              </button>
            </div>
          </div>

          <div className="toggle-grid">
            {modeSeries.map((series) => {
              const enabled = !disabledSeries.includes(series.key);
              
              return (
                
                
                <button
                  key={series.key}
                  type="button"
                  className={`series-toggle-btn ${enabled ? "active" : "inactive"}`}
                  onClick={() => toggleSeries(series.key)}
                >
                 
                  <span className="series-dot" style={{ backgroundColor: series.color }} />
                  {series.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="chart-container chart-panel" ref={chartPlotRef}>
        {visibleSeries.length === 0 && (
          <div className="empty-series-message">Turn on at least one channel to view live data.</div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
              axisLine={false}
              tickLine={false}
              domain={yAxisDomain}
            />
            <Tooltip
              allowEscapeViewBox={{ x: false, y: false }}
              contentStyle={{
                background: "#002D20",
                border: "none",
                borderRadius: "1rem",
                color: "white",
                height: "100%",
              }}
            />
            {visibleSeries.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.label}
                stroke={series.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TelemetryChart;
