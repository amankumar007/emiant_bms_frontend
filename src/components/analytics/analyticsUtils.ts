import type { DeviceLatest } from "../../services/deviceService";
import type { Telemetry } from "./types";

export const parseCompactDeviceDateTime = (dateValue?: string, timeValue?: string) => {
  if (!dateValue || !timeValue) return null;

  const dateDigits = dateValue.replace(/\D/g, "");
  const timeDigits = timeValue.replace(/\D/g, "");
  if (dateDigits.length !== 6 || timeDigits.length !== 6) return null;

  const day = Number(dateDigits.slice(0, 2));
  const month = Number(dateDigits.slice(2, 4));
  const year = 2000 + Number(dateDigits.slice(4, 6));
  const hours = Number(timeDigits.slice(0, 2));
  const minutes = Number(timeDigits.slice(2, 4));
  const seconds = Number(timeDigits.slice(4, 6));

  if ([day, month, year, hours, minutes, seconds].some((value) => Number.isNaN(value))) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
};

export const parseReceivedAtTimestamp = (receivedAt?: string) => {
  if (!receivedAt) return null;

  const normalized = receivedAt.trim();
  const sqlTimestampMatch = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/
  );

  if (sqlTimestampMatch) {
    const [, year, month, day, hours, minutes, seconds] = sqlTimestampMatch;
    return Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds)
    );
  }

  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getTelemetryTimestampMs = (telemetry: Telemetry) => {
  return (
    parseReceivedAtTimestamp(telemetry.received_at) ??
    parseCompactDeviceDateTime(telemetry.date, telemetry.time) ??
    Date.now()
  );
};

export const formatChartTime = (timestampMs: number) => {
  return new Date(timestampMs).toLocaleTimeString("en-GB", {
    hour12: false,
  });
};

export const getCellsFromTelemetry = (telemetry: DeviceLatest) => {
  return Array.from({ length: 16 }, (_, i) => {
    const key = `c${i + 1}` as keyof DeviceLatest;
    return Number(telemetry[key] ?? 0);
  });
};

export const getTempsFromTelemetry = (telemetry: DeviceLatest) => {
  return [telemetry.t1, telemetry.t2, telemetry.t3, telemetry.t4].map((value) =>
    Number(value ?? 0)
  );
};
