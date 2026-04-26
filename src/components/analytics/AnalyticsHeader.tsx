import {
  getBoardRoleByDaddr,
  type DeviceBoard,
  type DeviceLatest,
  type DeviceListItem,
} from "../../services/deviceService";
import Select, { type SingleValue, type StylesConfig } from "react-select";

type SelectOption = {
  value: string;
  label: string;
};

type AnalyticsHeaderProps = {
  selectedDeviceId: string | null;
  selectedBoardId: number | null;
  latestSnapshot: DeviceLatest | null;
  devices: DeviceListItem[];
  boards: DeviceBoard[];
  onSelectDevice: (deviceId: string) => void;
  onSelectBoard: (boardId: number) => void;
};

const AnalyticsHeader = ({
  selectedDeviceId,
  selectedBoardId,
  latestSnapshot,
  devices,
  boards,
  onSelectDevice,
  onSelectBoard,
}: AnalyticsHeaderProps) => {
  const role = getBoardRoleByDaddr(latestSnapshot?.daddr);

  const deviceOptions: SelectOption[] = devices.map((device) => ({
    value: device.d_id,
    label: device.name ? `${device.d_id} - ${device.name}` : device.d_id,
  }));

  const boardOptions: SelectOption[] = boards
    .map((board) => ({
      value: String(board.daddr),
      label: board.daddr === 0 ? "Master (0)" : `Slave (${board.daddr})`,
    }))
    .sort((a, b) => Number(a.value) - Number(b.value));

  const selectedDeviceOption =
    deviceOptions.find((option) => option.value === selectedDeviceId) ?? null;
  const selectedBoardOption =
    boardOptions.find((option) => option.value === String(selectedBoardId)) ?? null;

  const selectStyles: StylesConfig<SelectOption, false> = {
    control: (base, state) => ({
      ...base,
      minHeight: "44px",
      borderRadius: "10px",
      borderColor: state.isFocused ? "#16a34a" : "#d1fae5",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(22, 163, 74, 0.15)" : "none",
      backgroundColor: "#ffffff",
      "&:hover": {
        borderColor: "#16a34a",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "2px 10px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "10px",
      overflow: "hidden",
      zIndex: 30,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#166534" : state.isFocused ? "#ecfdf5" : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#064e3b",
      fontWeight: 600,
    }),
  };

  const handleDeviceChange = (option: SingleValue<SelectOption>) => {
    if (!option) return;
    onSelectDevice(option.value);
  };

  const handleBoardChange = (option: SingleValue<SelectOption>) => {
    if (!option) return;
    onSelectBoard(Number(option.value));
  };

  return (
    <div className="analytics-header">
      <div className="analytics-title">
        <div className="analytics-title-row">
          <h2>Analytics</h2>
          <span className="live-indicator">
            <span className="live-dot" /> Live
          </span>
        </div>
        <p>Device: {selectedDeviceId ?? "--"}</p>
        <p>
          Board: {role} • DAddr: {latestSnapshot?.daddr ?? "--"} • Date: {latestSnapshot?.date ?? "--"} • Time:{" "}
          {latestSnapshot?.time ?? "--"}
        </p>
      </div>

      <div className="analytics-toolbar">
        <div className="analytics-select-group">
          <label className="analytics-select-label" htmlFor="analytics-device-select">
            Device
          </label>
          <Select
            inputId="analytics-device-select"
            className="analytics-select"
            classNamePrefix="analytics-react-select"
            options={deviceOptions}
            value={selectedDeviceOption}
            onChange={handleDeviceChange}
            isSearchable
            placeholder="Search and select device"
            styles={selectStyles}
          />
        </div>

        <div className="analytics-select-group">
          <label className="analytics-select-label" htmlFor="analytics-board-select">
            Master/Slave
          </label>
          <Select
            inputId="analytics-board-select"
            className="analytics-select"
            classNamePrefix="analytics-react-select"
            options={boardOptions}
            value={selectedBoardOption}
            onChange={handleBoardChange}
            isSearchable={false}
            placeholder="Select board"
            styles={selectStyles}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
