import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { SelfAppBuilder } from '@selfxyz/core';

interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

interface TicketVerificationProps {
    eventId: string;
    onVerificationComplete?: (result: any) => void;
}

export default function TicketVerification({ eventId, onVerificationComplete }: TicketVerificationProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();
    const user = session?.user as SessionUser;

    const handleVerification = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // First check if user has tickets
            const checkResponse = await fetch(`/api/verify-ticket/${eventId}?userId=${user?.id}`);
            const checkData = await checkResponse.json();

            if (checkData.hasTicket) {
                // User already has tickets, return success
                onVerificationComplete?.(checkData);
                return;
            }

            // If no tickets, proceed with Self ID verification
            const selfApp = new SelfAppBuilder({
                appName: "My Self Ticket",
                scope: "My-Self-Ticket",
                endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}/api/verify`,
                endpointType: "https",
                logoBase64: "https://i.imgur.com/Rz8B3s7.png",
                userId: user?.id || '',
                disclosures: {
                    date_of_birth: true,
                    name: true,
                },
                devMode: true,
            }).build();

            // Handle the verification result
            const verificationResult = await selfApp.verifyWithQR();
            
            // Send verification result to backend
            const verifyResponse = await fetch(`/api/verify-ticket/${eventId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    proof: verificationResult.proof,
                    publicSignals: verificationResult.publicSignals,
                }),
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.status === 'success') {
                onVerificationComplete?.(verifyData);
            } else {
                setError(verifyData.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError('An error occurred during verification');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                    {error}
                </div>
            )}
            
            <button
                onClick={handleVerification}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {isLoading ? 'Verifying...' : 'Verify Ticket'}
            </button>

            {isLoading && (
                <div className="text-center text-gray-600">
                    Please complete the verification in your Self app
                </div>
            )}
        </div>
    );
} 