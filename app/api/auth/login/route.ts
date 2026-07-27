import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate request
    const result = loginSchema.safeParse(body);

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

    // 3. Extract validated data
    const { email, password } = result.data;

    // 4. Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // 5. User not found
    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // 6. Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    // 7. Password incorrect
    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // 8. Generating JWT here next
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        message: "Login successful",
        token,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
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