'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface CheckoutPageProps {
  searchParams: {
    eventId: string;
    ticketIds: string;
  };
}

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      if (!session?.user) {
        alert('Please sign in to purchase tickets');
        return;
      }

      const ticketIds = searchParams.ticketIds.split(',');
      
      const response = await fetch('/api/create-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: searchParams.eventId,
          ticketIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create tickets');
      }

      alert('Tickets purchased successfully!');
      router.push('/my-tickets');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to purchase tickets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <div className="space-y-4">
          <p>You are about to purchase {searchParams.ticketIds.split(',').length} ticket(s)</p>
          <button 
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Processing...' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
} 