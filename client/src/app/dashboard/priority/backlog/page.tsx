"use client";

import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/state/api";
import { useSession } from "next-auth/react";

const Backlog = () => {
  const { data: session } = useSession();
  
  return (
    <ReusablePriorityPage 
      priority={Priority.Backlog} 
      userRole={session?.user?.role} 
    />
  );
};

export default Backlog;