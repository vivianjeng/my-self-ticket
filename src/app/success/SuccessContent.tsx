'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function handleSuccess() {
      if (!sessionId) {
        toast({
          title: 'Error',
          description: 'Invalid session',
          variant: 'destructive',
        });
        return;
      }

      try {
        const response = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error('Payment confirmation failed');
        }

        toast({
          title: 'Success!',
          description: 'Your tickets have been purchased successfully.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: JSON.stringify(error),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    handleSuccess();
  }, [sessionId, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Processing your payment...</h1>
          <p className="text-gray-600">Please wait while we confirm your purchase.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your tickets have been confirmed.
        </p>
        <Link
          href="/"
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
} 