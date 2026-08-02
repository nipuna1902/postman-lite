import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { METHODS_WITH_BODY } from "@/lib/constants";
import { substitute, deepSubstitute } from "@/lib/substituteVariables";

export async function POST(
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

    const savedRequest = await prisma.request.findFirst({
      where: {
        id: requestId,
        collection: {
          workspace: {
            userId,
          },
        },
      },
      include: {
        collection: true,
      },
    });

    if (!savedRequest) {
      return NextResponse.json(
        { message: "Request not found or access denied" },
        { status: 404 }
      );
    }

    // Optionally, the frontend can tell us which environment is active.
    const body = await request.json().catch(() => null);
    const environmentId = body?.environmentId as number | undefined;

    let variables: Record<string, string> = {};

    if (environmentId) {
      const environment = await prisma.environment.findFirst({
        where: {
          id: environmentId,
          workspaceId: savedRequest.collection.workspaceId,
        },
      });
      variables = (environment?.variables as Record<string, string>) ?? {};
    }

    const finalUrl = substitute(savedRequest.url, variables);
    const finalHeaders = savedRequest.headers
      ? (Object.fromEntries(
          Object.entries(savedRequest.headers as Record<string, string>).map(([k, v]) => [
            k,
            substitute(v, variables),
          ])
        ) as HeadersInit)
      : {};
    const finalBody = deepSubstitute(savedRequest.body, variables);

    const startTime = Date.now();
    const response = await fetch(finalUrl, {
      method: savedRequest.method,
      headers: finalHeaders,
      body:
        finalBody && METHODS_WITH_BODY.has(savedRequest.method)
          ? JSON.stringify(finalBody)
          : undefined,
    });
    const endTime = Date.now();
    const duration = endTime - startTime;

    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType?.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

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
        duration,
        data: responseData,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}