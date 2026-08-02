import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { environmentSchema } from "@/lib/validations/environment";

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
    const environmentId = Number(id);

    // Ownership check first — one hop, since Environment points directly at Workspace.
    const savedEnvironment = await prisma.environment.findFirst({
      where: {
        id: environmentId,
        workspace: {
          userId,
        },
      },
    });

    if (!savedEnvironment) {
      return NextResponse.json(
        { message: "Environment not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = environmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, variables } = result.data;

    await prisma.environment.update({
      where: { id: environmentId },
      data: {
        name,
        variables,
      },
    });

    return NextResponse.json(
      { message: "Environment updated successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}