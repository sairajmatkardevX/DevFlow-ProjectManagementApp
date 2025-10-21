
"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store } from "./store"; 
import { persistStore } from "redux-persist";
import { setupListeners } from "@reduxjs/toolkit/query";


const persistor = persistStore(store);
setupListeners(store.dispatch);


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

