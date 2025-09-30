import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface KeyValue {
  key: string;
  value: string;
}

export type EnvState = {
  envs: KeyValue[];
};

const initialState: EnvState = {
  envs: [],
};

export type KeyValueAction = {
  index: number;
  keyValue: KeyValue;
};

export const envSlice = createSlice({
  name: "env",
  initialState,
  reducers: {
    add: (state, action: PayloadAction<KeyValue>) => {
      state.envs.push(action.payload);
    },
    remove: (state, action: PayloadAction<number>) => {
      state.envs = state.envs.filter((_, i) => i !== action.payload);
    },
    update: (state, action: PayloadAction<KeyValueAction>) => {
      state.envs[action.payload.index] = action.payload.keyValue;
    },
    setEnvs: (state, action: PayloadAction<KeyValue[]>) => {
      state.envs = action.payload;
    },
  },
});
