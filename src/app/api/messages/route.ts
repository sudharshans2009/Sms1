import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch messages for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'received'; // 'sent' or 'received'
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const whereClause: any = type === 'sent' 
      ? { senderId: userId }
      : { receiverId: userId };

    if (unreadOnly && type === 'received') {
      whereClause.isRead = false;
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 messages
    });

    // Count unread messages if fetching received
    const unreadCount = type === 'received'
      ? await prisma.message.count({
          where: {
            receiverId: userId,
            isRead: false,
          },
        })
      : 0;

    return NextResponse.json({
      messages,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a new message or mark as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Mark message as read
    if (action === 'markAsRead') {
      const { messageId } = body;
      
      if (!messageId) {
        return NextResponse.json(
          { error: 'Message ID is required' },
          { status: 400 }
        );
      }

      const message = await prisma.message.update({
        where: { id: messageId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message,
      });
    }

    // Send a new message
    const {
      subject,
      content,
      senderId,
      senderName,
      senderRole,
      receiverId,
      receiverName,
      receiverRole,
      priority = 'NORMAL',
    } = body;

    // Validate required fields
    if (!subject || !content || !senderId || !senderName || !senderRole || 
        !receiverId || !receiverName || !receiverRole) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        subject,
        content,
        senderId,
        senderName,
        senderRole,
        receiverId,
        receiverName,
        receiverRole,
        priority,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
