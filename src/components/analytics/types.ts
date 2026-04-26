import type { DeviceLatest } from "../../services/deviceService";

export type AnalyticsMode = "cells" | "currents" | "temps";

export type Snapshot = DeviceLatest;
export type Telemetry = DeviceLatest;

export type AnalyticsPoint = {
  time: string;
  timestampMs: number;
  cells: number[];
  current: number;
  temps: number[];
  packVoltage: number;
  soc: number;
};

export type ChartRow = Record<string, number | string>;

export type SummaryStats = {
  cellMax: number;
  cellMin: number;
  maxTemp: number;
  imbalance: number;
  cellVoltageData: Array<{
    cell: string;
    voltage: number;
  }>;
};
