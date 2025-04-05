import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SeatSelection from '@/components/SeatSelection';

async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      tickets: {
        orderBy: [
          { row: 'asc' },
          { seatNumber: 'asc' }
        ]
      },
    },
  });

  if (!event) {
    notFound();
  }

  return event;
}

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);
  const session = await getServerSession(authOptions);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          <p className="text-gray-600 mb-4">{event.description}</p>
          <div className="mb-4">
            <p className="text-lg">
              <span className="font-semibold">Date:</span>{' '}
              {new Date(event.date).toLocaleDateString()}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Venue:</span> {event.venue}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Price:</span> ${event.price}
            </p>
          </div>
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}
        </div>
        <div>
          {session ? (
            <SeatSelection event={event} />
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800">
                Please log in to select seats and purchase tickets.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 