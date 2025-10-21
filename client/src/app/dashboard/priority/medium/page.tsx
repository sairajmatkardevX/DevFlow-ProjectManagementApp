"use client";

import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/state/api";
import { useSession } from "next-auth/react";

const Medium = () => {
  const { data: session } = useSession();
  
  return (
    <ReusablePriorityPage 
      priority={Priority.Medium} 
      userRole={session?.user?.role}
    />
  );
};

export default Medium;