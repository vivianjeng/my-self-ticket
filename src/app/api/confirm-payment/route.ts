import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return NextResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { message: 'Payment not completed' },
        { status: 400 }
      );
    }

    const { eventId, userId } = session.metadata as {
      eventId: string;
      userId: string;
    };

    // Update ticket status and create order
    const order = await prisma.order.create({
      data: {
        userId,
        total: session.amount_total! / 100, // Convert from cents
        status: 'PAID',
        tickets: {
          create: {
            eventId,
            userId,
            status: 'SOLD',
          },
        },
      },
    });

    // Update event available seats
    await prisma.event.update({
      where: { id: eventId },
      data: {
        availableSeats: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { message: 'Error confirming payment' },
      { status: 500 }
    );
  }
} 