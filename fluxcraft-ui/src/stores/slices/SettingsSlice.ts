import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Settings {
  rootPath: string;
  export: {
    csv: {
      separator: string;
    };
  };
  serverUrl?: string;
}

const initState: Settings = {
  rootPath: "",
  export: {
    csv: {
      separator: ",",
    },
  },
};

const loadedState: Settings = localStorage.getItem("settings")
  ? JSON.parse(localStorage.getItem("settings")!)
  : initState;

export const settingsSlice = createSlice({
  name: "settings",
  initialState: loadedState,
  reducers: {
    update: (state, action: PayloadAction<Settings>) => {
      state.rootPath = action.payload.rootPath;
      state.export = action.payload.export;
      state.serverUrl = action.payload.serverUrl;
      localStorage.setItem("settings", JSON.stringify(state));
    },
  },
});
