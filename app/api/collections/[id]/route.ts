import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const collectionId = Number(id);

    // 1. Ownership check FIRST — no point validating a stranger's data
    const savedCollection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
          workspace: {
            userId,
          },
      },
    });

    if (!savedCollection) {
      return NextResponse.json(
        { message: "Collection not found or access denied" },
        { status: 404 }
      );
    }
    await prisma.collection.delete({
      where: { id: collectionId },
    });
    return NextResponse.json(
      { message: "Collection deleted successfully" },
      { status: 200 }
    );

  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}