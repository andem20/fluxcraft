import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const HISTORY_KEY = "history";

export interface SqlHistory {
  query: string;
  timestamp: Date;
  cell: string;
}

function loadHistory(): SqlHistory[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<
      Omit<SqlHistory, "timestamp"> & { timestamp: string }
    >;

    return parsed.map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch {
    return [];
  }
}

const initialState: SqlHistory[] = loadHistory();

export const historySlice = createSlice({
  name: HISTORY_KEY,
  initialState,
  reducers: {
    add: (state, action: PayloadAction<SqlHistory>) => {
      if (state[state.length - 1]?.query !== action.payload.query) {
        state.push(action.payload);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(state));
      }
    },
    clear: (state) => {
      state.length = 0;
      localStorage.removeItem(HISTORY_KEY);
    },
  },
});
