'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Event {
  id: string;
  title: string;
  price: number;
  tickets: {
    id: string;
    status: string;
    row: number;
    seatNumber: number;
  }[];
}

interface SeatSelectionProps {
  event: Event;
}

export default function SeatSelection({ event: initialEvent }: SeatSelectionProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState(initialEvent);
  const router = useRouter();
  const { data: session } = useSession();

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}`);
      if (!response.ok) throw new Error('Failed to fetch event data');
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

  const handleSeatClick = (ticketId: string) => {
    if (selectedSeats.includes(ticketId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== ticketId));
    } else {
      if (selectedSeats.length >= 4) {
        alert('You can only select up to 4 seats at a time.');
        return;
      }
      setSelectedSeats([...selectedSeats, ticketId]);
    }
  };

  const handlePurchase = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/create-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          ticketIds: selectedSeats,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create tickets');
      }

      // Refresh event data to update available seats
      await fetchEventData();
      
      alert('Tickets purchased successfully!');
      router.push('/my-tickets');
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to purchase tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = selectedSeats.length * event.price;

  // Group tickets by row
  const ticketsByRow = event.tickets.reduce((acc, ticket) => {
    if (!acc[ticket.row]) {
      acc[ticket.row] = [];
    }
    acc[ticket.row].push(ticket);
    return acc;
  }, {} as Record<number, typeof event.tickets>);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Select Seats</h2>
      
      {/* Stage */}
      <div className="bg-gray-200 h-16 mb-8 rounded-lg flex items-center justify-center">
        <span className="text-gray-600 font-semibold">STAGE</span>
      </div>

      {/* Seats */}
      <div className="space-y-4 mb-6">
        {Object.entries(ticketsByRow).map(([row, tickets]) => (
          <div key={row} className="flex items-center space-x-4">
            <div className="w-8 text-sm font-semibold text-gray-600">Row {row}</div>
            <div className="flex space-x-2">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => handleSeatClick(ticket.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    selectedSeats.includes(ticket.id)
                      ? 'bg-indigo-600 text-white'
                      : ticket.status === 'AVAILABLE'
                      ? 'bg-gray-200 hover:bg-gray-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={ticket.status !== 'AVAILABLE'}
                  title={`Row ${row}, Seat ${ticket.seatNumber}`}
                >
                  {ticket.seatNumber}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend and Purchase Button */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Selected seats: {selectedSeats.length}</p>
            <p className="text-lg font-bold">Total: ${totalPrice}</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-indigo-600 rounded-full mr-2"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 rounded-full mr-2"></div>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={handlePurchase}
            disabled={isLoading || selectedSeats.length === 0}
            className="w-full max-w-xs px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-400 text-sm font-medium"
          >
            {isLoading ? 'Processing...' : 'Purchase Tickets'}
          </button>
        </div>
      </div>
    </div>
  );
} 