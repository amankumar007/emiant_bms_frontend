import { useEffect, useMemo, useState } from "react";
import { getDevices, type DeviceListItem } from "../services/deviceService";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../styles/devices.css";

const Devices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [showAllDevices, setShowAllDevices] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseLastSeen = (value?: string) => {
    if (!value) return null;
    const match = value.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/
    );
    if (!match) return null;
    const [, year, month, day, hour, minute, second] = match;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
    return Number.isNaN(date.getTime()) ? null : date;
  };

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const data = await getDevices();
        setError("");
        setDevices(data);
      } catch (err) {
        setError("Failed to fetch devices");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const filteredDevices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return showAllDevices ? devices : devices.slice(0, 5);
    }
    return devices.filter(
      (device) =>
        device.d_id.toLowerCase().includes(term) ||
        (device.name || "").toLowerCase().includes(term) ||
        (device.last_seen || "").toLowerCase().includes(term)
    );
  }, [devices, searchTerm, showAllDevices]);

  const getStatus = (device: DeviceListItem) => {
    const lastSeenDate = parseLastSeen(device.last_seen);
    if (!lastSeenDate) {
      return "unknown";
    }
    return Date.now() - lastSeenDate.getTime() < 15 * 60 * 1000 ? "active" : "inactive";
  };

  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="devices-view">
      <div className="devices-header">
        <div>
          <h2>Devices</h2>
          <p className="devices-subtitle">Inventory overview</p>
        </div>
      </div>

      <div className="devices-topbar">
        <div className="search-input-wrap devices-search full-width">
          <Search size={18} color="#7aa893" className="search-icon" />
          <input
            type="text"
            placeholder="Search by Device ID or Location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="devices-actions">
          <button
            className="ghost-btn"
            type="button"
            onClick={() => setShowAllDevices((prev) => !prev)}
            disabled={searchTerm.trim().length > 0}
          >
            {showAllDevices ? "Show Pinned Devices" : "Show All Devices"}
          </button>
          {user?.role === "admin" && (
            <button
              className="primary-btn"
              type="button"
              onClick={() => navigate("/admin")}
            >
              + Add Device
            </button>
          )}
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="devices-section">
        <div className="devices-section-header">
          <h3>{isSearching ? "Search Results" : showAllDevices ? "All Devices" : "Pinned Devices"}</h3>
          {!isSearching && (
            <span className="device-count">
              {showAllDevices ? `${devices.length} devices` : "5 devices"}
            </span>
          )}
        </div>

        {loading ? (
          <p>Loading devices...</p>
        ) : filteredDevices.length === 0 ? (
          <div className="empty-state">No devices found</div>
        ) : (
          <div className="devices-table">
            <div className="devices-table-head">
              <span>Device ID / Name</span>
              <span>Details</span>
              <span>Actions</span>
            </div>

            {filteredDevices.map((device) => (
              <div key={device.d_id} className="devices-table-row">
                <div className="device-main-cell">
                  <span className="row-strong">{device.d_id}</span>
                  <span className="row-secondary">{device.name || "Unnamed Device"}</span>
                </div>
                <div className="row-actions">
                     <button
                    className="row-btn row-btn-secondary"
                    type="button"
                    onClick={() => setSelectedDevice(device)}
                  >
                    View Information
                  </button>
                 
                </div>
               <button
                    className="row-btn"
                    type="button"
                    onClick={() => navigate(`/analytics/${device.d_id}`)}
                  >
                    View Analytics
                  </button>
                 
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDevice && (
        <div className="device-info-modal-overlay" onClick={() => setSelectedDevice(null)}>
          <div
            className="device-info-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Device information"
          >
            <h3>Device Information</h3>
            <div className="device-info-grid">
              <p>
                <strong>Device ID:</strong> {selectedDevice.d_id}
              </p>
              <p>
                <strong>Last Seen:</strong>{" "}
                {parseLastSeen(selectedDevice.last_seen)?.toLocaleString() || "--"}
              </p>
              <p>
                <strong>Total Records:</strong> {selectedDevice.total_records ?? "0"}
              </p>
              <p>
                <strong>Status:</strong> {getStatus(selectedDevice)}
              </p>
            </div>
            <div className="device-info-actions">
              <button
                className="ghost-btn"
                type="button"
                onClick={() => setSelectedDevice(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
