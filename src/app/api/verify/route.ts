import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getUserIdentifier, SelfBackendVerifier } from '@selfxyz/core';
import { ethers } from 'ethers';
import { abi } from '@/app/content/abi';

export async function POST(request: Request) {
    try {
        const { proof, publicSignals } = await request.json();

        if (!proof || !publicSignals) {
            return NextResponse.json({ message: 'Proof and publicSignals are required' }, { status: 400 });
        }

        console.log("Proof:", proof);
        console.log("Public signals:", publicSignals);

        // Contract details
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const endpoint = "https://339e-122-99-30-134.ngrok-free.app/api/verify";

        // Uncomment this to use the Self backend verifier for offchain verification instead
        const selfdVerifier = new SelfBackendVerifier(
            // 'https://forno.celo.org',
            "My-Self-Ticket",
            endpoint,
            "hex",
            true // If you want to use mock passport
        );
        const result = await selfdVerifier.verify(proof, publicSignals);
        console.log("Verification result:", result);
        // console.log("Successfully called verifySelfProof function");
        return NextResponse.json({
            status: 'success',
            result: true,
            credentialSubject: {},
        }, { status: 200 });

        // const address = await getUserIdentifier(publicSignals, "hex");
        // console.log("Extracted address from verification result:", address);

        // // Connect to Celo network
        // // const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
        // const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        // const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
        // const contract = new ethers.Contract(contractAddress, abi, signer);

        // try {
        //     const tx = await contract.verifySelfProof({
        //         a: proof.a,
        //         b: [
        //             [proof.b[0][1], proof.b[0][0]],
        //             [proof.b[1][1], proof.b[1][0]],
        //         ],
        //         c: proof.c,
        //         pubSignals: publicSignals,
        //     });
        //     await tx.wait();
        //     console.log("Successfully called verifySelfProof function");
        //     return NextResponse.json({
        //         status: 'success',
        //         result: true,
        //         credentialSubject: {},
        //     }, { status: 200 });
        // } catch (error) {
        //     console.error("Error calling verifySelfProof function:", error);
        //     return NextResponse.json({
        //         status: 'error',
        //         result: false,
        //         message: 'Verification failed or date of birth not disclosed',
        //         details: {},
        //     }, { status: 400 });
        // }
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