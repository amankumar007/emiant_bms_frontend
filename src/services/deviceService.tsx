import axios from "./axiosConfig";

const BASE = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${BASE}/api/devices`;

export type DeviceListItem = {
  d_id: string;
  name?: string;  //if devcie name there it can be good
  last_seen: string;
  total_records: number | string;
};

export type DeviceLatest = {
  d_id: string;
  date?: string;
  time?: string;
  daddr?: number;
  pack_voltage: number;
  pack_current: number;
  capacity: number;
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  c6: number;
  c7: number;
  c8: number;
  c9: number;
  c10: number;
  c11: number;
  c12: number;
  c13: number;
  c14: number;
  c15: number;
  c16: number;
  dt1?: number;
  dt2?: number;
  bals: string | number | boolean | null;
  received_at: string;
};

export type BoardRole = "master" | "slave" | "unknown";

export type DeviceBoard = {
  boardId: number;
  daddr: number;
  role: BoardRole;
  label: string;
  totalRecords?: number;
  lastSeen?: string;
};

export type RegisterDeviceRequest = {
  deviceId: string;
  name: string;
  ratedCapacityAh: number;
  slaveCount: number;
};

export const getBoardRoleByDaddr = (daddr?: number | null): BoardRole => {
  if (daddr === 0) return "master";
  if (typeof daddr === "number" && daddr >= 1 && daddr <= 15) return "slave";
  return "unknown";
};

const toNumberOrNull = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeBoard = (rawBoard: unknown): DeviceBoard | null => {
  if (typeof rawBoard === "number" || typeof rawBoard === "string") {
    const boardId = toNumberOrNull(rawBoard);
    if (boardId === null) return null;
    const role = getBoardRoleByDaddr(boardId);
    return {
      boardId,
      daddr: boardId,
      role,
      label: role === "unknown" ? `board ${boardId}` : `${role} (${boardId})`,
    };
  }

  if (!rawBoard || typeof rawBoard !== "object") return null;
  const entry = rawBoard as Record<string, unknown>;

  const rawBoardId =
    toNumberOrNull(entry.boardId) ??
    toNumberOrNull(entry.board_id) ??
    toNumberOrNull(entry.id);
  const daddr = toNumberOrNull(entry.daddr) ?? rawBoardId;

  if (daddr === null) return null;

  const boardId = daddr;
  const role = getBoardRoleByDaddr(daddr);

  return {
    boardId,
    daddr,
    role,
    label: role === "unknown" ? `board ${boardId}` : `${role} (${daddr})`,
    totalRecords: toNumberOrNull(entry.total_records) ?? undefined,
    lastSeen: typeof entry.last_seen === "string" ? entry.last_seen : undefined,
  };
};

const createDefaultBoard = (daddr: number): DeviceBoard => {
  const role = getBoardRoleByDaddr(daddr);
  return {
    boardId: daddr,
    daddr,
    role,
    label: role === "unknown" ? `board ${daddr}` : `${role} (${daddr})`,
  };
};

const normalizeDeviceListItem = (rawDevice: unknown): DeviceListItem | null => {
  if (!rawDevice || typeof rawDevice !== "object") return null;

  const entry = rawDevice as Record<string, unknown>;
  const dId = typeof entry.d_id === "string" ? entry.d_id : null;
  if (!dId) return null;
  const name =
    typeof entry.name === "string"
      ? entry.name
      : typeof entry.device_name === "string"
        ? entry.device_name
        : undefined;

  const rootLastSeen = typeof entry.last_seen === "string" ? entry.last_seen : null;
  const rootTotalRecords = toNumberOrNull(entry.total_records);

  const boards = Array.isArray(entry.boards) ? entry.boards : [];
  const boardLastSeenCandidates = boards
    .map((board) => {
      if (!board || typeof board !== "object") return null;
      const boardEntry = board as Record<string, unknown>;
      return typeof boardEntry.last_seen === "string" ? boardEntry.last_seen : null;
    })
    .filter((value): value is string => Boolean(value));

  const boardRecordTotal = boards.reduce((sum, board) => {
    if (!board || typeof board !== "object") return sum;
    const boardEntry = board as Record<string, unknown>;
    const total = toNumberOrNull(boardEntry.total_records);
    return sum + (total ?? 0);
  }, 0);

  const lastSeen =
    rootLastSeen ??
    (boardLastSeenCandidates.length > 0
      ? boardLastSeenCandidates.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0))[0]
      : "");

  const totalRecords = rootTotalRecords ?? boardRecordTotal;

  return {
    d_id: dId,
    name,
    last_seen: lastSeen,
    total_records: totalRecords,
  };
};

export const getDevices = async (): Promise<DeviceListItem[]> => {
  const response = await axios.get(`${API_BASE_URL}`);
  const payload = response.data;
  const rawDevices = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.devices)
      ? payload.devices
      : [];

  return rawDevices
    .map((device: unknown) => normalizeDeviceListItem(device))
    .filter((device: DeviceListItem | null): device is DeviceListItem => device !== null);
};

export const getDeviceLatest = async (deviceId: string): Promise<DeviceLatest> => {
  const response = await axios.get(`${API_BASE_URL}/${deviceId}/latest`);
  return response.data?.data ?? response.data;
};

export const getDeviceBoards = async (deviceId: string): Promise<DeviceBoard[]> => {
  const response = await axios.get(`${API_BASE_URL}/${deviceId}/boards`);
  const payload = response.data;

  const rawBoards = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.boards)
      ? payload.boards
      : [];

  const uniqueByDaddr = new Map<number, DeviceBoard>();

  rawBoards
    .map((rawBoard: unknown) => normalizeBoard(rawBoard))
    .filter((board: DeviceBoard | null): board is DeviceBoard => board !== null)
    .forEach((board: DeviceBoard) => {
      uniqueByDaddr.set(board.daddr, board);
    });

  Array.from({ length: 16 }, (_, index) => index).forEach((daddr) => {
    if (!uniqueByDaddr.has(daddr)) {
      uniqueByDaddr.set(daddr, createDefaultBoard(daddr));
    }
  });

  return Array.from(uniqueByDaddr.values()).sort((a, b) => a.daddr - b.daddr);
};

export const getDeviceBoardLatest = async (
  deviceId: string,
  boardDaddr: number
): Promise<DeviceLatest> => {
  const response = await axios.get(`${API_BASE_URL}/${deviceId}/boards/${boardDaddr}/latest`);
  const payload = response.data?.data ?? response.data;
  const normalizedDaddr = toNumberOrNull(payload?.daddr) ?? boardDaddr;
  return {
    ...payload,
    daddr: normalizedDaddr,
  };
};

// Get battery data history for a specific device
export const getDeviceHistory = async (
  deviceId: string,
  startTs?: string | null,
  endTs?: string | null
) => {
  const params = new URLSearchParams();
  if (startTs) params.set("start_ts", startTs);
  if (endTs) params.set("end_ts", endTs);
  const query = params.toString();
  const url = query
    ? `${API_BASE_URL}/${deviceId}/data?${query}`
    : `${API_BASE_URL}/${deviceId}/data`;
  const response = await axios.get(url);
  return response.data?.data ?? response.data;
};

export const registerDevice = async (payload: RegisterDeviceRequest) => {
  const body = {
    d_id: payload.deviceId,
    name: payload.name,
    rated_capacity_ah: payload.ratedCapacityAh,
    slave_count: payload.slaveCount,
  };

  const response = await axios.post(`${API_BASE_URL}/register`, body);
  return response.data;
};
