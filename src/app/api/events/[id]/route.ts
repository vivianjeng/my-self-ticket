import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop(); // crude way to get [id]

  try {
    const event = await prisma.event.findUnique({
      where: { id: id },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        date: true,
        description: true,
        price: true,
        availableSeats: true,
        tickets: {
          where: {
            status: 'UNAVAILABLE',
          },
          select: {
            id: true,
            row: true,
            seatNumber: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
} 