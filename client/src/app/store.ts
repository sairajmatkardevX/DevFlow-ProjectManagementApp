// app/store.ts
'use client';

import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/state/api";
import globalReducer from "@/state";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { combineReducers } from "@reduxjs/toolkit";
// Import React Redux hooks here
import { useDispatch, useSelector } from "react-redux";

const createNoopStorage = () => ({
  getItem: () => Promise.resolve(null),
  setItem: (_: string, value: any) => Promise.resolve(value),
  removeItem: () => Promise.resolve(),
});

const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["global"],
};

const rootReducer = combineReducers({
  global: globalReducer,
  [api.reducerPath]: api.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks FROM THIS FILE
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();