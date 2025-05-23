// app/api/chat/[projectId]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/chat/[projectId]/messages
// POST /api/chat/[projectId]/messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const messages = await prisma.message.findMany({
      where: { projectId },
      include: {
        sender: {
          select: { name: true }, // Include only the sender's name
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Failed to fetch messages", { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  try {
    const body = await request.json();
    const { senderId, content } = body;

    if (!content?.trim()) {
      return new NextResponse("Message content is required", { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        projectId,
        senderId,
        content,
      },
    });

    // Fetch the sender's name separately
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    return NextResponse.json({
      ...newMessage,
      sender: { name: sender?.name || null }, // Include the sender's name in the response
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return new NextResponse("Failed to create message", { status: 500 });
  }
}
