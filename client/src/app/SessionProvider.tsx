// components/SessionProvider.tsx (or in your layout if inline)
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { Session } from "next-auth";

interface Props {
  children: React.ReactNode;
  session?: Session | null;
}

export default function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider 
      session={session}
      // CRITICAL: Configure to prevent DELETE requests
      refetchInterval={0} // Disable automatic refetching
      refetchOnWindowFocus={false} // Don't refetch on window focus
      refetchWhenOffline={false} // Don't try to refetch when offline
    >
      {children}
    </NextAuthSessionProvider>
  );
}

// Usage in app/layout.tsx:
// <SessionProvider session={session}>
//   {children}
// </SessionProvider>