import type { AnalyticsMode } from "./types";

type ModeTabsProps = {
  mode: AnalyticsMode;
  onModeChange: (mode: AnalyticsMode) => void;
};

const ModeTabs = ({ mode, onModeChange }: ModeTabsProps) => {
  return (
    <div className="mode-tabs">
      <button className={mode === "cells" ? "active" : ""} onClick={() => onModeChange("cells")}>
        Cell Voltages
      </button>

      <button
        className={mode === "currents" ? "active" : ""}
        onClick={() => onModeChange("currents")}
      >
        Pack Current
      </button>

      <button className={mode === "temps" ? "active" : ""} onClick={() => onModeChange("temps")}>
        Temperature
      </button>
    </div>
  );
};

export default ModeTabs;
