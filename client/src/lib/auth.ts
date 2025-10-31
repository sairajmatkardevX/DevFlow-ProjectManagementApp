import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  // ✅ FIXED: Use JWT strategy for Vercel compatibility
  session: {
    strategy: "jwt", // Changed from "database"
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.userId.toString(),
          email: user.email,
          name: user.username || user.email.split("@")[0],
          role: user.role || "user",
          image: user.profilePictureUrl || "/p1.jpeg",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.picture = user.image;
        console.log("🔑 JWT created for:", user.email);
      }

      // Handle session updates (e.g., profile changes)
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.image = token.picture as string;
        console.log("📋 Session created for:", session.user.email);
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};