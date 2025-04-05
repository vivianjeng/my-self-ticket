"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from "uuid";
import { signIn } from "next-auth/react";
import type { SelfApp } from "@selfxyz/qrcode";

// Dynamically import SelfQRcodeWrapper with no SSR
const SelfQRcodeWrapper = dynamic(
  () => import("@selfxyz/qrcode").then(mod => mod.default),
  { ssr: false }
);

interface VerificationResult {
    proof: {
        a: string[];
        b: string[][];
        c: string[];
    };
    publicSignals: string[];
}

export default function RegisterForm() {
    const router = useRouter();
    const [verificationResult] = useState<VerificationResult | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        setUserId(uuidv4());
    }, []);

    useEffect(() => {
        async function handleVerification() {
            if (!verificationResult) return;

            try {
                // Get the user data from the verification result
                const response = await fetch('/api/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        proof: verificationResult.proof,
                        publicSignals: verificationResult.publicSignals,
                    }),
                });

                const data = await response.json();
                
                if (!data.user) {
                    throw new Error('Failed to get user data');
                }

                // Sign in with the user's credentials
                const signInResult = await signIn("credentials", {
                    passportNumber: data.user.passportNumber,
                    dateOfBirth: data.user.dateOfBirth,
                    redirect: false,
                });
                
                if (signInResult?.error) {
                    console.error("Sign in error:", signInResult.error);
                    return;
                }
                
                router.push("/");
                router.refresh();
            } catch (error) {
                console.error("Error during sign in:", error);
            }
        }

        handleVerification();
    }, [verificationResult, router]);

    if (!userId) return null;

    const selfApp: SelfApp = {
        appName: "My Self Ticket",
        scope: "My-Self-Ticket",
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}/api/verify`,
        endpointType: "https",
        logoBase64: "https://i.imgur.com/Rz8B3s7.png",
        userId,
        disclosures: {
            date_of_birth: true,
            name: true,
        },
        devMode: true,
        header: "Login with Self",
        sessionId: uuidv4(),
        userIdType: "uuid"
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Login with Self
                    </h2>
                    <SelfQRcodeWrapper
                        selfApp={selfApp}
                        onSuccess={async () => {
                            console.log("Verification successful");
                            try {
                                // Get the verification result from our endpoint
                                const response = await fetch('/api/verify', {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                });

                                const data = await response.json();
                                
                                if (data.status === 'success' && data.user) {
                                    // Sign in with the user's credentials
                                    const signInResult = await signIn("credentials", {
                                        passportNumber: data.user.passportNumber,
                                        dateOfBirth: data.user.dateOfBirth,
                                        redirect: false,
                                    });
                                    
                                    if (signInResult?.error) {
                                        console.error("Sign in error:", signInResult.error);
                                        return;
                                    }
                                    
                                    router.push("/");
                                    router.refresh();
                                }
                            } catch (error) {
                                console.error("Error during sign in:", error);
                            }
                        }}
                        darkMode={false}
                    />
                </div>
            </div>
        </div>
    );
} 