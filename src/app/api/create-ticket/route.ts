import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { eventId, ticketIds } = await request.json();

    if (!eventId || !ticketIds || !Array.isArray(ticketIds)) {
      return NextResponse.json(
        { message: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Create orders for each ticket
    const orders = await Promise.all(
      ticketIds.map(ticketId =>
        prisma.order.create({
          data: {
            userId: user.id,
            ticketId,
            status: 'COMPLETED',
          },
        })
      )
    );

    // Update tickets status
    await prisma.ticket.updateMany({
      where: {
        id: {
          in: ticketIds,
        },
      },
      data: {
        status: 'UNAVAILABLE',
        userId: user.id,
      },
    });

    // Update event available seats
    await prisma.event.update({
      where: { id: eventId },
      data: {
        availableSeats: {
          decrement: ticketIds.length,
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Ticket creation error:', error);
    return NextResponse.json(
      { message: 'Error creating tickets' },
      { status: 500 }
    );
  }
} 