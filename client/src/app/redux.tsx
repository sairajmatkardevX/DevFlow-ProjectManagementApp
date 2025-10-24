"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store } from "./store"; 
import { persistStore } from "redux-persist";
import { setupListeners } from "@reduxjs/toolkit/query";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const persistorRef = useRef<any>(null);
  
  if (!persistorRef.current) {
    persistorRef.current = persistStore(store);
    setupListeners(store.dispatch);
  }

  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        } 
        persistor={persistorRef.current}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}