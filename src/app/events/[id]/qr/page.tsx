"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SelfQRcodeWrapper, { SelfApp, SelfAppBuilder } from "@selfxyz/qrcode";
import { v4 as uuidv4 } from "uuid";
import { signIn } from "next-auth/react";

interface VerificationResult {
    proof: any;
    publicSignals: any;
}

interface SelfVerificationResult {
    proof: {
        a: string[];
        b: string[][];
        c: string[];
    };
    publicSignals: string[];
}

export default function QRCodePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [verificationResult, setVerificationResult] =
        useState<VerificationResult | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [eventName, setEventName] = useState<string>("");

    useEffect(() => {
        setUserId(uuidv4());
        // Get event name from URL
        const path = window.location.pathname;
        const eventId = path.split("/")[2];
        // Fetch event details
        fetch(`/api/events/${eventId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.title) {
                    setEventName(data.title);
                }
            })
            .catch((err) => console.error("Error fetching event:", err));
    }, []);

    useEffect(() => {
        async function handleVerification() {
            if (!verificationResult) return;

            try {
                // Get the user data from the verification result
                const response = await fetch(
                    `/api/verify-ticket/${params.id}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            proof: verificationResult.proof,
                            publicSignals: verificationResult.publicSignals,
                        }),
                    }
                );

                const data = await response.json();
                console.log("data", data);
            } catch (error) {
                console.error("Error during sign in:", error);
            }
        }

        handleVerification();
    }, [verificationResult, router]);

    if (!userId) return null;

    const selfApp = new SelfAppBuilder({
        appName: "My Self Ticket",
        scope: "My-Self-Ticket",
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}/api/verify-ticket/${params.id}`,
        endpointType: "https",
        logoBase64: "https://i.imgur.com/Rz8B3s7.png",
        userId,
        disclosures: {
            date_of_birth: true,
            name: true,
        },
        devMode: true,
    } as Partial<SelfApp>).build();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Event Attendance
                    </h2>
                    <p className="mt-2 text-center text-xl text-gray-600">
                        {eventName}
                    </p>
                    <p className="mt-4 text-center text-gray-500">
                        Scan this QR code with your Self app to verify your
                        attendance
                    </p>
                    <div className="mt-8">
                        <SelfQRcodeWrapper
                            selfApp={selfApp}
                            onSuccess={async () => {
                                console.log("Verification successful");
                                try {
                                    if (!verificationResult) return;
                                    // Get the verification result from our endpoint
                                    const response = await fetch(
                                        `/api/verify-ticket/${params.id}`,
                                        {
                                            method: "GET",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                proof: verificationResult.proof,
                                                publicSignals:
                                                    verificationResult.publicSignals,
                                            }),
                                        }
                                    );

                                    const data = await response.json();
                                    console.log("data", data);
                                } catch (error) {
                                    console.error(
                                        "Error during sign in:",
                                        error
                                    );
                                }
                            }}
                            darkMode={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
