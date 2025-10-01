// app/DashboardWrapper.tsx
"use client";

import React from "react";
import StoreProvider from "./redux"; // Only import the Provider
// DO NOT import useAppSelector here

// This component should NOT use any Redux hooks
// It just wraps children with the Provider
const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  );
};

export { DashboardWrapper };