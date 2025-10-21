
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";


export default function SessionProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
 
  return (
    <NextAuthSessionProvider 
      refetchInterval={15*60}
      refetchOnWindowFocus={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}