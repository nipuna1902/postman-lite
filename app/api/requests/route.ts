import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { requestSchema } from "@/lib/validations/request";

export async function POST(request: Request) {
  try {

    // ==========================
    // 1. Read Authorization Header
    // ==========================
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ==========================
    // 2. Extract JWT Token
    // ==========================
    const token = authHeader.split(" ")[1];

    // ==========================
    // 3. Verify JWT
    // ==========================
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    // ==========================
    // 4. Extract Logged-in User ID
    // ==========================
    const { userId } = payload as { userId: number };

    // ==========================
    // 5. Read Request Body
    // ==========================
    const body = await request.json();

    // ==========================
    // 6. Validate Body using Zod
    // ==========================
    const result = requestSchema.safeParse(body);

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

    // ==========================
    // 7. Extract Validated Data
    // ==========================
    const {
      name,
      method,
      url,
      headers,
      body: requestBody,
      collectionId,
    } = result.data;

    // ==========================
    // 8. Check Collection Ownership
    // ==========================
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        workspace: {
          userId,
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        {
          message: "Collection not found or access denied",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================
    // 9. Save Request
    // ==========================
    const created = await prisma.request.create({
      data: {
        name,
        method,
        url,
        headers,
        body: requestBody,
        collectionId,
      },
    });

    // ==========================
    // 10. Return Success
    // ==========================
    return NextResponse.json(
      {
        message: "Request created successfully",
        id: created.id,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
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

    const { searchParams } = new URL(request.url);
    const collectionId = Number(searchParams.get("collectionId"));

    if (!collectionId) {
      return NextResponse.json(
        { message: "collectionId query param is required" },
        { status: 400 }
      );
    }

    const requests = await prisma.request.findMany({
      where: {
        collectionId,
        collection: {
          workspace: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(
      { requests },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}