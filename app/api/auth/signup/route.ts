import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          errors: result.error.flatten().fieldErrors,
        },
        {
          status: 400,
        }
      );
    }
    const { name, email, password } = result.data;
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email already registered",
        },
        {
          status: 409,
        }
      );
    }
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          workspaces: {
          create: { name: "My Workspace" },
          },
        },
      });

    console.log(name, email, password);
    return NextResponse.json({
      message: "Validation successful",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        message: "Invalid request",
      },
      {
        status: 400,
      }
    );
  }
}