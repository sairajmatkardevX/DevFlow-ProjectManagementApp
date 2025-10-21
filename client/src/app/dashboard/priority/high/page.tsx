"use client";

import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/state/api";
import { useSession } from "next-auth/react";

const High = () => {
  const { data: session } = useSession();
  
  return (
    <ReusablePriorityPage 
      priority={Priority.High} 
      userRole={session?.user?.role} 
    />
  );
};

export default High;