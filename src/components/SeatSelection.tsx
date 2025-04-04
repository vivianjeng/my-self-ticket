'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  price: number;
  tickets: {
    id: string;
    status: string;
  }[];
}

interface SeatSelectionProps {
  event: Event;
}

export default function SeatSelection({ event }: SeatSelectionProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSeatClick = (ticketId: string) => {
    if (selectedSeats.includes(ticketId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== ticketId));
    } else {
      if (selectedSeats.length >= 4) {
        toast({
          title: 'Maximum seats reached',
          description: 'You can only select up to 4 seats at a time.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedSeats([...selectedSeats, ticketId]);
    }
  };

  const totalPrice = selectedSeats.length * event.price;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Select Seats</h2>
      <div className="grid grid-cols-8 gap-2 mb-6">
        {event.tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => handleSeatClick(ticket.id)}
            className={`w-8 h-8 rounded-full ${
              selectedSeats.includes(ticket.id)
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            disabled={ticket.status !== 'AVAILABLE'}
          >
            {ticket.id.slice(-1)}
          </button>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Selected seats: {selectedSeats.length}</p>
          <p className="text-lg font-bold">Total: ${totalPrice}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-600 rounded-full mr-2"></div>
            <span className="text-sm">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
} 