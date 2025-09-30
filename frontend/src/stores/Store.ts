import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fileSlice } from "./slices/FileSlice";
import { envSlice } from "./slices/EnvSlice";

const initialDarkModeState = {
  enabled: JSON.parse(localStorage.getItem("darkMode") || "false"),
};

const darkModeSlice = createSlice({
  name: "darkMode",
  initialState: initialDarkModeState,
  reducers: {
    toggleDarkMode: (state) => {
      state.enabled = !state.enabled;
      localStorage.setItem("darkMode", JSON.stringify(state.enabled));
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
      localStorage.setItem("darkMode", JSON.stringify(state.enabled));
    },
  },
});

export const { toggleDarkMode, setDarkMode } = darkModeSlice.actions;

const initialState: { dataframes: string[] } = {
  dataframes: [],
};

export const dataframesOverviewSlice = createSlice({
  name: "dataframeOverview",
  initialState,
  reducers: {
    update: (state, action: PayloadAction<string[]>) => {
      state.dataframes = action.payload;
    },
  },
});

export const store = configureStore({
  reducer: {
    file: fileSlice.reducer,
    darkMode: darkModeSlice.reducer,
    dataframeOverviewSlice: dataframesOverviewSlice.reducer,
    env: envSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["your/action/type"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["items.dates"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
