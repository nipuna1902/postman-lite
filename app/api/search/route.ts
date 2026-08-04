import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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
    const query = searchParams.get("q") ?? "";

    if (!workspaceId) {
      return NextResponse.json(
        { message: "workspaceId query param is required" },
        { status: 400 }
      );
    }

    if (!query.trim()) {
      return NextResponse.json({ requests: [] }, { status: 200 });
    }

    const requests = await prisma.request.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        collection: {
          workspaceId,
          workspace: { userId },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}