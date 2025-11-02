import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const profilePicture = formData.get("profilePicture") as File | null;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email or username is already registered" },  // ✅ Generic but helpful
        { status: 400 }
      );
    }

    let profilePictureUrl = null;

    // File upload handling (existing code remains same)
    if (profilePicture && profilePicture.size > 0) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles");
        await mkdir(uploadsDir, { recursive: true });

        const timestamp = Date.now();
        const fileExtension = profilePicture.name.split('.').pop() || 'jpg';
        const fileName = `${username}-${timestamp}.${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        const bytes = await profilePicture.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        profilePictureUrl = `/uploads/profiles/${fileName}`;
      } catch (fileError) {
        console.error("File upload error:", fileError);
        // Continue without profile picture
      }
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "user",
        profilePictureUrl,
      }
    });

    return NextResponse.json(
      { 
        message: "User created successfully", 
        userId: user.userId,
        profilePictureUrl 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}