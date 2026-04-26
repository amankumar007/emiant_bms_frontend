import type { DeviceLatest } from "../../services/deviceService";
import type { SummaryStats } from "./types";

type SummaryCardsProps = {
  latestSnapshot: DeviceLatest;
  summaryStats: SummaryStats;
};

const SummaryCards = ({ latestSnapshot, summaryStats }: SummaryCardsProps) => {
  return (
    <div className="summary-cards">
      <div className="summary-card">
        <span>SOC</span>
        <strong>{latestSnapshot.capacity}%</strong>
        <p>State of charge</p>
      </div>
      <div className="summary-card">
        <span>Pack Voltage</span>
        <strong>{latestSnapshot.pack_voltage} V</strong>
        <p>Nominal range</p>
      </div>
      <div className="summary-card">
        <span>Current</span>
        <strong>{latestSnapshot.pack_current} A</strong>
        <p>{latestSnapshot.pack_current >= 0 ? "Charging" : "Discharging"}</p>
      </div>
      <div className="summary-card">
        <span>Max Temp</span>
        <strong>{summaryStats.maxTemp.toFixed(1)}°C</strong>
        <p>Thermal headroom</p>
      </div>
      <div className="summary-card">
        <span>Cell Imbalance</span>
        <strong>{summaryStats.imbalance.toFixed(3)} V</strong>
        <p>Max-min</p>
      </div>
    </div>
  );
};

export default SummaryCards;
