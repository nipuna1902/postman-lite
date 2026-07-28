import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { METHODS_WITH_BODY } from "@/lib/constants";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    // ==========================
    // Get Request ID
    // ==========================
    const { id } = await params;
    const requestId = Number(id);
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
    {
      message: "Request not found or access denied",
    },
    {
      status: 404,
    }
  );
}
  const startTime = Date.now();
  const response = await fetch(savedRequest.url,{
      method: savedRequest.method,

    headers: (savedRequest.headers as HeadersInit) || {},
    body:
    savedRequest.body &&
    METHODS_WITH_BODY.has(savedRequest.method)
      ? JSON.stringify(savedRequest.body)
      : undefined,
    });
    const endTime = Date.now();
    const duration = endTime - startTime;
    // ==========================
    // Read Response Body
    // ==========================
    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType?.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    // ==========================
    // 7. Save Execution History
    // ==========================
    await prisma.history.create({
      data: {
        statusCode: response.status,
        response: responseData,
        duration: duration,
        requestId: savedRequest.id,
      },
    });
    return NextResponse.json(
      {
        status: response.status,
        success: response.ok,
        data: responseData,
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