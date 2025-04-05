'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navigation() {
  const { data: session } = useSession();
  console.log(session);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center text-xl font-bold text-indigo-600"
            >
              TicketHub
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href="/my-tickets"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  My Tickets
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 