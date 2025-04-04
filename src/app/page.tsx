import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function getEvents() {
  const events = await prisma.event.findMany({
    where: {
      availableSeats: {
        gt: 0,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
  return events;
}

export default async function Home() {
  const events = await getEvents();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">
                {new Date(event.date).toLocaleDateString()}
              </span>
              <span className="text-lg font-bold">${event.price}</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {event.availableSeats} seats available
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
