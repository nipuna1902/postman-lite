import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { requestSchema } from "@/lib/validations/request";

export async function PUT(
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
    const requestId = Number(id);

    // 1. Ownership check FIRST — no point validating a stranger's data
    const savedRequest = await prisma.request.findFirst({
      where: {
        id: requestId,
        collection: {
          workspace: {
            userId,
          },
        },
      },
    });

    if (!savedRequest) {
      return NextResponse.json(
        { message: "Request not found or access denied" },
        { status: 404 }
      );
    }

    // 2. Read + validate the new data
    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      name,
      method,
      url,
      headers,
      body: requestBody,
      collectionId,
    } = result.data;

    // 3. Actually update the row
    await prisma.request.update({
      where: { id: requestId },
      data: {
        name,
        method,
        url,
        headers,
        body: requestBody,
        collectionId,
      },
    });

    // 4. Confirm success
    return NextResponse.json(
      { message: "Request updated successfully" },
      { status: 200 }
    );

  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
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
    const requestId = Number(id);

    // 1. Ownership check FIRST — no point validating a stranger's data
    const savedRequest = await prisma.request.findFirst({
      where: {
        id: requestId,
        collection: {
          workspace: {
            userId,
          },
        },
      },
    });

    if (!savedRequest) {
      return NextResponse.json(
        { message: "Request not found or access denied" },
        { status: 404 }
      );
    }

    // 2. Read + validate the new data

    if (!savedRequest) {
      return NextResponse.json(
        { message: "Request not found or access denied" },
        { status: 404 }
      );
    }

    // 3. Actually update the row
    await prisma.request.delete({
      where: { id: requestId },
    });

    // 4. Confirm success
    return NextResponse.json(
      { message: "Request deleted successfully" },
      { status: 200 }
    );

  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}