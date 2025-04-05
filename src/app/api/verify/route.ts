import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getUserIdentifier, SelfBackendVerifier } from '@selfxyz/core';
import { ethers } from 'ethers';
import { abi } from '@/app/content/abi';

let lastVerificationResult: any = null;

export async function POST(request: Request) {
    try {
        const { proof, publicSignals } = await request.json();

        if (!proof || !publicSignals) {
            return NextResponse.json({ message: 'Proof and publicSignals are required' }, { status: 400 });
        }

        console.log("Proof:", JSON.stringify(proof, null, 2));
        console.log("Public signals:", JSON.stringify(publicSignals, null, 2));

        // Contract details
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const endpoint = `${process.env.SELF_ENDPOINT}/api/verify`;

        // Uncomment this to use the Self backend verifier for offchain verification instead
        const selfdVerifier = new SelfBackendVerifier(
            // 'https://forno.celo.org',
            "My-Self-Ticket",
            endpoint,
            "hex",
            true // If you want to use mock passport
        );
        const result = await selfdVerifier.verify(proof, publicSignals);
        console.log("Verification result:", JSON.stringify(result, null, 2));

        if (!result.credentialSubject.passport_number) {
            return NextResponse.json({ message: 'Passport number not found in verification result' }, { status: 400 });
        }

        const passportNumber = JSON.stringify(result.credentialSubject.passport_number)
        console.log("Decoded passport number:", passportNumber);

        const existingUser = await prisma.user.findUnique({
            where: { passportNumber: passportNumber },
        });

        let user;
        if (!existingUser) {
            user = await prisma.user.create({
                data: {
                    name: JSON.stringify(result.credentialSubject.name),
                    passportNumber: passportNumber,
                    dateOfBirth: result.credentialSubject.date_of_birth || '',
                },
            });
            console.log("Created new user:", user);
        } else {
            user = existingUser;
            console.log("Found existing user:", user);
        }

        // Store the verification result for the GET request
        lastVerificationResult = {
            status: 'success',
            result: true,
            user: {
                id: user.id,
                passportNumber: user.passportNumber,
                name: user.name,
                dateOfBirth: user.dateOfBirth
            }
        };

        return NextResponse.json(lastVerificationResult, { status: 200 });
    } catch (error) {
        console.error('Error verifying proof:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Error verifying proof',
            result: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET() {
    if (!lastVerificationResult) {
        return NextResponse.json({
            status: 'error',
            message: 'No verification result available'
        }, { status: 404 });
    }

    return NextResponse.json(lastVerificationResult);
}