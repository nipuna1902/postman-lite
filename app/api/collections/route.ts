import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { collectionSchema } from "@/lib/validations/collection";

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

const result = collectionSchema.safeParse(body);

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

const { name, workspaceId } = result.data;
const workspace = await prisma.workspace.findFirst({
  where: {
    id: workspaceId,
    userId,
  },
});

if (!workspace) {
  return NextResponse.json(
    {
      message: "Workspace not found",
    },
    {
      status: 403,
    }
  );
}

    await prisma.collection.create({
      data: {
        name,
        workspaceId,
      },
    });
    return NextResponse.json(
  {
    message: "Collection created successfully",
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