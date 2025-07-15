import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as wasm from "polars-wasm";

export type FileState = {
  file?: File | null;
  df?: wasm.DataFrameJS | null;
  fluxcraft: wasm.FluxCraftJS;
};

const initialState: FileState = {
  file: null,
  df: null,
  fluxcraft: new wasm.FluxCraftJS(),
};

export const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {
    setFile: (state, action: PayloadAction<File>) => {
      state.file = action.payload;
    },
    setDataFrame: (state, action: PayloadAction<wasm.DataFrameJS>) => {
      state.df = action.payload;
    },
  },
});
