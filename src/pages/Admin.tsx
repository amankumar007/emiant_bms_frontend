import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import { getDevices, registerDevice } from "../services/deviceService";
import "../styles/admin.css";

interface DeviceFormData {
  deviceId: string;
  name: string;
  slaveCount: number;
  ratedCapacityAh: number;
}

interface RegisteredDeviceRecord {
  d_id: string;
  name: string;
  rated_capacity_ah: number;
  slave_count: number;
  createdAt: string;
}

const RECENT_DEVICES_KEY = "recentlyAddedDevices";

const Admin = () => {
  const [formData, setFormData] = useState<DeviceFormData>({
    deviceId: "",
    name: "",
    slaveCount: 0,
    ratedCapacityAh: 0,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentDevices, setRecentDevices] = useState<RegisteredDeviceRecord[]>([]);
  const [telemetryDeviceIds, setTelemetryDeviceIds] = useState<string[]>([]);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_DEVICES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as RegisteredDeviceRecord[];
      if (Array.isArray(parsed)) {
        setRecentDevices(parsed);
      }
    } catch {
      setRecentDevices([]);
    }
  }, []);

  const refreshTelemetryDevices = async () => {
    try {
      setTelemetryLoading(true);
      const devices = await getDevices();
      setTelemetryDeviceIds(devices.map((device) => device.d_id));
    } catch {
      setTelemetryDeviceIds([]);
    } finally {
      setTelemetryLoading(false);
    }
  };

  useEffect(() => {
    refreshTelemetryDevices();
  }, []);

  const configWithoutTelemetry = useMemo(() => {
    const telemetryIdsSet = new Set(telemetryDeviceIds);
    return recentDevices.filter((device) => !telemetryIdsSet.has(device.d_id));
  }, [recentDevices, telemetryDeviceIds]);

  const persistRecentDevices = (records: RegisteredDeviceRecord[]) => {
    setRecentDevices(records);
    localStorage.setItem(RECENT_DEVICES_KEY, JSON.stringify(records));
  };

  const clearRecentDevices = () => {
    localStorage.removeItem(RECENT_DEVICES_KEY);
    setRecentDevices([]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "slaveCount") {
      setFormData((prev) => ({
        ...prev,
        [name]: Math.max(0, parseInt(value) || 0),
      }));
    } else if (name === "ratedCapacityAh") {
      setFormData((prev) => ({
        ...prev,
        ratedCapacityAh: Math.max(0, Number(value) || 0),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!formData.deviceId.trim()) {
      setError("Device ID is required");
      return;
    }
    if (!formData.name.trim()) {
      setError("Device Name is required");
      return;
    }
    if (formData.slaveCount < 0) {
      setError("Slave boards cannot be negative");
      return;
    }
    if (formData.ratedCapacityAh <= 0) {
      setError("Rated capacity (Ah) must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      const response = await registerDevice({
        deviceId: formData.deviceId.trim(),
        name: formData.name.trim(),
        ratedCapacityAh: formData.ratedCapacityAh,
        slaveCount: formData.slaveCount,
      });

      const successMessage =
        (typeof response?.msg === "string" && response.msg) ||
        (typeof response?.message === "string" && response.message) ||
        "Device added successfully.";

      const createdRecord: RegisteredDeviceRecord = {
        d_id: typeof response?.d_id === "string" ? response.d_id : formData.deviceId.trim(),
        name: typeof response?.name === "string" ? response.name : formData.name.trim(),
        rated_capacity_ah:
          typeof response?.rated_capacity_ah === "number"
            ? response.rated_capacity_ah
            : formData.ratedCapacityAh,
        slave_count:
          typeof response?.slave_count === "number"
            ? response.slave_count
            : formData.slaveCount,
        createdAt:
          typeof response?.createdAt === "string"
            ? response.createdAt
            : new Date().toISOString(),
      };

      const nextRecentDevices = [
        createdRecord,
        ...recentDevices.filter((item) => item.d_id !== createdRecord.d_id),
      ].slice(0, 20);
      persistRecentDevices(nextRecentDevices);
      await refreshTelemetryDevices();

      setMessage(successMessage);
      setFormData({
        deviceId: "",
        name: "",
        slaveCount: 0,
        ratedCapacityAh: 0,
      });
    } catch (err: unknown) {
      let apiMessage = "Failed to add device";
      if (axios.isAxiosError(err)) {
        apiMessage =
          err.response?.data?.msg ||
          err.response?.data?.message ||
          err.message ||
          apiMessage;
      } else if (err instanceof Error) {
        apiMessage = err.message;
      }
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-form-card">
        <div className="admin-accent" />
        <div className="admin-form-body">
          <h2 className="admin-form-title">Add New Device</h2>
          <p className="admin-form-description">
            Fill in the device details to add a new device to the system.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="deviceId" className="form-label">
                Device ID
              </label>
              <input
                id="deviceId"
                className="form-input-huge"
                name="deviceId"
                placeholder="e.g., BM000001"
                value={formData.deviceId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Device Name
              </label>
              <input
                id="name"
                className="form-input-huge"
                name="name"
                placeholder="e.g., Battery Module 1"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="slaveCount" className="form-label">
                  Slave Boards
                </label>
                <input
                  id="slaveCount"
                  className="form-input-huge"
                  type="number"
                  name="slaveCount"
                  min="0"
                  value={formData.slaveCount}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ratedCapacityAh" className="form-label">
                  Rated Capacity (Ah)
                </label>
                <input
                  id="ratedCapacityAh"
                  className="form-input-huge"
                  type="number"
                  name="ratedCapacityAh"
                  min="0"
                  step="any"
                  value={formData.ratedCapacityAh}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button className="add-device-btn" type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Device"}
              </button>
            </div>
          </form>

          {message && (
            <p className="form-success">
              {message}
            </p>
          )}

          <div className="recent-devices-block">
            <div className="recent-devices-header">
              <h3>Newly Added Devices</h3>
              <div className="recent-devices-actions">
                <button
                  type="button"
                  className="clear-recent-btn"
                  onClick={refreshTelemetryDevices}
                  disabled={telemetryLoading}
                >
                  {telemetryLoading ? "Checking..." : "Refresh Telemetry"}
                </button>
                {recentDevices.length > 0 && (
                  <button
                    type="button"
                    className="clear-recent-btn"
                    onClick={clearRecentDevices}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {recentDevices.length === 0 ? (
              <p className="recent-empty">No newly added devices yet.</p>
            ) : (
              <div className="recent-devices-list">
                {recentDevices.map((device) => (
                  <div key={device.d_id} className="recent-device-item">
                    <p className="recent-device-id">{device.d_id}</p>
                    <p className="recent-device-name">{device.name || "Unnamed Device"}</p>
                    <p className="recent-device-meta">
                      Capacity: {device.rated_capacity_ah} Ah | Slave boards: {device.slave_count}
                    </p>
                    <p className="recent-device-time">
                      Added: {new Date(device.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="recent-devices-block">
            <div className="recent-devices-header">
              <h3>Config Devices Without Telemetry</h3>
            </div>
            {configWithoutTelemetry.length === 0 ? (
              <p className="recent-empty">All tracked config devices have telemetry data.</p>
            ) : (
              <div className="recent-devices-list">
                {configWithoutTelemetry.map((device) => (
                  <div key={`${device.d_id}-pending`} className="recent-device-item pending-device-item">
                    <p className="recent-device-id">{device.d_id}</p>
                    <p className="recent-device-name">{device.name || "Unnamed Device"}</p>
                    <p className="recent-device-meta">
                      Capacity: {device.rated_capacity_ah} Ah | Slave boards: {device.slave_count}
                    </p>
                    <p className="pending-telemetry-note">Waiting for first telemetry packet.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;