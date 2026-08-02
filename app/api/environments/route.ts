import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { environmentSchema } from "@/lib/validations/environment";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { userId } = payload as { userId: number };
    const body = await request.json();

    const result = environmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, workspaceId } = result.data;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { message: "Workspace not found or access denied" },
        { status: 403 }
      );
    }

    const created = await prisma.environment.create({
      data: {
        name,
        workspaceId,
      },
    });

    return NextResponse.json(
      { message: "Environment created successfully", id: created.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { userId } = payload as { userId: number };

    const { searchParams } = new URL(request.url);
    const workspaceId = Number(searchParams.get("workspaceId"));

    if (!workspaceId) {
      return NextResponse.json(
        { message: "workspaceId query param is required" },
        { status: 400 }
      );
    }

    const environments = await prisma.environment.findMany({
      where: {
        workspaceId,
        workspace: {
          userId,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ environments }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}