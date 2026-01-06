import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Settings {
  rootPath: string;
}

const initialState: Settings = JSON.parse(
  localStorage.getItem("settings") || JSON.stringify({ rootPath: "" })
);

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    update: (state, action: PayloadAction<Settings>) => {
      state.rootPath = action.payload.rootPath;
      localStorage.setItem("settings", JSON.stringify(state));
    },
  },
});
