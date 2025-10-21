"use client";

import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/state/api";
import { useSession } from "next-auth/react";

const Urgent = () => {
  const { data: session } = useSession();
  
  return (
    <ReusablePriorityPage 
      priority={Priority.Urgent} 
      userRole={session?.user?.role}
    />
  );
};

export default Urgent;