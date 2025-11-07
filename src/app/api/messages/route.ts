import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch messages with advanced filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'received'; // received, sent, starred, archived, drafts
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const threadId = searchParams.get('threadId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build filter conditions
    const where: any = {};

    // Type-based filtering
    if (type === 'received') {
      where.receiverId = userId;
      where.isDraft = false;
    } else if (type === 'sent') {
      where.senderId = userId;
      where.isDraft = false;
    } else if (type === 'starred') {
      where.OR = [
        { receiverId: userId, isStarred: true },
        { senderId: userId, isStarred: true },
      ];
      where.isDraft = false;
    } else if (type === 'archived') {
      where.OR = [
        { receiverId: userId, isArchived: true },
        { senderId: userId, isArchived: true },
      ];
    } else if (type === 'drafts') {
      where.senderId = userId;
      where.isDraft = true;
    }

    // Additional filters
    if (unreadOnly && type === 'received') {
      where.isRead = false;
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { senderName: { contains: search, mode: 'insensitive' } },
        { receiverName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (threadId) {
      where.threadId = threadId;
    }

    // Fetch messages with pagination
    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          attachments: true,
          replyTo: {
            select: {
              id: true,
              subject: true,
              senderName: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),
      prisma.message.count({ where }),
    ]);

    // Get unread count for received messages
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
        isDraft: false,
        isArchived: false,
      },
    });

    // Get counts for all categories
    const counts = {
      received: await prisma.message.count({
        where: { receiverId: userId, isDraft: false, isArchived: false },
      }),
      sent: await prisma.message.count({
        where: { senderId: userId, isDraft: false, isArchived: false },
      }),
      starred: await prisma.message.count({
        where: {
          OR: [
            { receiverId: userId, isStarred: true },
            { senderId: userId, isStarred: true },
          ],
          isDraft: false,
        },
      }),
      archived: await prisma.message.count({
        where: {
          OR: [
            { receiverId: userId, isArchived: true },
            { senderId: userId, isArchived: true },
          ],
        },
      }),
      drafts: await prisma.message.count({
        where: { senderId: userId, isDraft: true },
      }),
      unread: unreadCount,
    };

    return NextResponse.json({
      success: true,
      messages,
      unreadCount,
      counts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create message or perform actions (mark as read, star, etc.)
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

    // Mark message as unread
    if (action === 'markAsUnread') {
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
          isRead: false,
          readAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        message,
      });
    }

    // Toggle star
    if (action === 'toggleStar') {
      const { messageId } = body;

      if (!messageId) {
        return NextResponse.json(
          { error: 'Message ID is required' },
          { status: 400 }
        );
      }

      const existingMessage = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!existingMessage) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }

      const message = await prisma.message.update({
        where: { id: messageId },
        data: {
          isStarred: !existingMessage.isStarred,
        },
      });

      return NextResponse.json({
        success: true,
        message,
      });
    }

    // Archive/Unarchive message
    if (action === 'toggleArchive') {
      const { messageId } = body;

      if (!messageId) {
        return NextResponse.json(
          { error: 'Message ID is required' },
          { status: 400 }
        );
      }

      const existingMessage = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!existingMessage) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }

      const message = await prisma.message.update({
        where: { id: messageId },
        data: {
          isArchived: !existingMessage.isArchived,
        },
      });

      return NextResponse.json({
        success: true,
        message,
      });
    }

    // Send new message or save draft
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
      category = 'GENERAL',
      isDraft = false,
      replyToId,
      threadId,
      scheduledFor,
    } = body;

    // Validate required fields for sending (not for drafts)
    if (!isDraft) {
      if (!subject || !content || !senderId || !senderName || !senderRole || 
          !receiverId || !receiverName || !receiverRole) {
        return NextResponse.json(
          { error: 'Missing required fields for sending message' },
          { status: 400 }
        );
      }
    } else {
      // For drafts, only sender info is required
      if (!senderId || !senderName || !senderRole) {
        return NextResponse.json(
          { error: 'Sender information is required for drafts' },
          { status: 400 }
        );
      }
    }

    // Generate thread ID if this is a reply
    let finalThreadId = threadId;
    if (replyToId && !threadId) {
      const parentMessage = await prisma.message.findUnique({
        where: { id: replyToId },
      });
      finalThreadId = parentMessage?.threadId || parentMessage?.id;
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        subject: subject || '(No Subject)',
        content: content || '',
        senderId,
        senderName,
        senderRole,
        receiverId: receiverId || '',
        receiverName: receiverName || '',
        receiverRole: receiverRole || 'STUDENT',
        priority,
        category,
        isDraft,
        replyToId,
        threadId: finalThreadId,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      },
      include: {
        attachments: true,
      },
    });

    return NextResponse.json({
      success: true,
      message,
      isDraft,
    });
  } catch (error: any) {
    console.error('Error creating/updating message:', error);
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update message (for editing drafts)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, ...updateData } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Only allow editing drafts
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (!existingMessage.isDraft) {
      return NextResponse.json(
        { error: 'Only draft messages can be edited' },
        { status: 400 }
      );
    }

    const message = await prisma.message.update({
      where: { id: messageId },
      data: updateData,
      include: {
        attachments: true,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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
      message: 'Message deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message', details: error.message },
      { status: 500 }
    );
  }
}
