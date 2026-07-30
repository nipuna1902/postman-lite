import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { workspaceSchema } from "@/lib/validations/workspace";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
        }
      );
    }

const { userId } = payload as { userId: number };
const body = await request.json();

const result = workspaceSchema.safeParse(body);

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

const { name } = result.data;
    await prisma.workspace.create({
      data: {
        name,
        userId,
      },
    });
    return NextResponse.json(
  {
    message: "Workspace created successfully",
  },
  {
    status: 201,
  }
);

  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    const { userId } = payload as { userId: number };

    const workspaces = await prisma.workspace.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(
      {
        workspaces,
      },
      {
        status: 200,
      }
    );
  } catch {
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}