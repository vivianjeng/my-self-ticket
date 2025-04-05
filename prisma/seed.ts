import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.upsert({
    where: { passportNumber: '00000000' },
    update: {},
    create: {
      passportNumber: '00000000',
      name: 'Test User',
      dateOfBirth: '05-04-01',
    },
  });

  // Create mock events
  const events = [
    {
      title: 'Taylor Swift - The Eras Tour',
      description: 'Experience the magic of Taylor Swift\'s record-breaking Eras Tour!',
      date: new Date('2024-06-15T19:00:00Z'),
      venue: 'SoFi Stadium',
      city: 'Los Angeles',
      price: 150,
      totalSeats: 100,
      availableSeats: 100,
      imageUrl: 'https://example.com/taylor-swift.jpg',
    },
    {
      title: 'Ed Sheeran - Mathematics Tour',
      description: 'Join Ed Sheeran for an unforgettable night of music and mathematics!',
      date: new Date('2024-07-20T20:00:00Z'),
      venue: 'Madison Square Garden',
      city: 'New York',
      price: 120,
      totalSeats: 80,
      availableSeats: 80,
      imageUrl: 'https://example.com/ed-sheeran.jpg',
    },
    {
      title: 'Beyoncé - Renaissance World Tour',
      description: 'Witness the Queen Bey\'s spectacular Renaissance World Tour!',
      date: new Date('2024-08-10T19:30:00Z'),
      venue: 'AT&T Stadium',
      city: 'Dallas',
      price: 200,
      totalSeats: 120,
      availableSeats: 120,
      imageUrl: 'https://example.com/beyonce.jpg',
    },
    {
      title: 'Coldplay - Music of the Spheres',
      description: 'Experience Coldplay\'s spectacular Music of the Spheres World Tour!',
      date: new Date('2024-09-05T20:00:00Z'),
      venue: 'Wembley Stadium',
      city: 'London',
      price: 180,
      totalSeats: 150,
      availableSeats: 150,
      imageUrl: 'https://example.com/coldplay.jpg',
    },
    {
      title: 'Drake - It\'s All A Blur Tour',
      description: 'Join Drake for an incredible night of hits and surprises!',
      date: new Date('2024-10-15T20:00:00Z'),
      venue: 'O2 Arena',
      city: 'London',
      price: 160,
      totalSeats: 90,
      availableSeats: 90,
      imageUrl: 'https://example.com/drake.jpg',
    },
  ];

  // First, delete all existing events and tickets to avoid duplicates
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();

  // Create events and their tickets
  for (const eventData of events) {
    const event = await prisma.event.create({
      data: eventData,
    });

    // Create tickets for this event
    for (let i = 1; i <= eventData.totalSeats; i++) {
      await prisma.ticket.create({
        data: {
          eventId: event.id,
          status: 'AVAILABLE',
          seatNumber: i,
          row: Math.ceil(i / 10), // 10 seats per row
          section: Math.ceil(Math.ceil(i / 10) / 5), // 5 rows per section
        },
      });
    }
  }

  // Create some sold tickets for the test user
  const testEvent = await prisma.event.findFirst();
  if (testEvent) {
    // Get 3 available tickets
    const availableTickets = await prisma.ticket.findMany({
      where: {
        eventId: testEvent.id,
        status: 'AVAILABLE',
      },
      take: 3,
    });

    // Update the tickets to sold status
    await prisma.ticket.updateMany({
      where: {
        id: {
          in: availableTickets.map(ticket => ticket.id),
        },
      },
      data: {
        status: 'SOLD',
        userId: user.id,
      },
    });
  }

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 