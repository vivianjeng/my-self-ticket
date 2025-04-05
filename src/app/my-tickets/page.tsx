import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

async function getTickets(userId: string) {
  const tickets = await prisma.ticket.findMany({
    where: {
      userId,
      status: 'UNAVAILABLE',
    },
    include: {
      event: true,
      orders: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return tickets;
}

export default async function MyTicketsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser;

  if (!user?.id) {
    redirect('/register');
  }

  const tickets = await getTickets(user.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Tickets</h1>
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">You haven't purchased any tickets yet.</p>
          <a
            href="/"
            className="inline-block mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Browse Events
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {ticket.event.imageUrl && (
                <img
                  src={ticket.event.imageUrl}
                  alt={ticket.event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">
                  {ticket.event.title}
                </h2>
                <p className="text-gray-600 mb-2">
                  {ticket.event.description}
                </p>
                <div className="text-sm text-gray-500">
                  <p>Date: {format(new Date(ticket.event.date), 'PPP')}</p>
                  <p>Venue: {ticket.event.venue}</p>
                  <p>City: {ticket.event.city}</p>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-lg font-semibold">
                    Status: <span className="text-green-600">Purchased</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
} 