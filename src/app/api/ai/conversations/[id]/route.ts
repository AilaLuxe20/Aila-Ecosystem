import { NextResponse } from "next/server";

import {
  getConversation,
  deleteConversation,
  renameConversation,
} from "@/core/ai/conversation";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  const conversation = getConversation(id);

  if (!conversation) {
    return NextResponse.json(
      {
        success: false,
        error: "Conversation not found.",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json({
    success: true,
    conversation,
  });
}

export async function DELETE(
  _req: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  return NextResponse.json({
    success: deleteConversation(id),
  });
}


export async function PATCH(
  req: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  const body = await req.json();

  const renamed = renameConversation(
    id,
    body.title ?? "Untitled"
  );

  return NextResponse.json({
    success: renamed,
  });
}
