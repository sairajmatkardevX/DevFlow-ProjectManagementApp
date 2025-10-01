
"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store } from "./store"; // Import from your existing store.ts
import { persistStore } from "redux-persist";
import { setupListeners } from "@reduxjs/toolkit/query";

// Create persistor
const persistor = persistStore(store);
setupListeners(store.dispatch);

// This file now ONLY exports the Provider
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

// DELETE all hook exports from this file (useAppSelector, useAppDispatch)
// DO NOT export any hooks from this file