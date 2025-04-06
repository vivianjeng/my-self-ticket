# My Self Ticket

To prevent ticket scalping and bots from snatching up tickets, many concert ticketing platforms in Taiwan require real-name registration. This means buyers must provide their national ID number and full name when purchasing tickets, and present their ID for verification at the event. However, this approach not only forces attendees to carry their ID to the concert, but also raises concerns about privacy and data exposure.

In this project, we use the [**Self Protocol**](https://self.xyz/) to address the issues mentioned above. With Self Protocol, users can scan their own passport and securely store the passport data on their mobile device. When required to provide this information, users can generate a Zero-Knowledge (ZK) proof to authenticate the data without revealing sensitive details. As a result, users only need to bring the mobile device that has previously scanned the passport, attend the concert, scan the QR code provided by the event staff, and have their name and ticket ownership verified.

## Technology

1. [Self Protocol](https://self.xyz/): Self Protocol offers both a mobile app and a TypeScript SDK for building websites and enabling interaction with the mobile app. The website displays a QR code that the mobile app can scan, initiating a WebSocket session. Once the session is established, the mobile app generates a Zero-Knowledge (ZK) proof, which is processed by an endpoint defined in the SDK. The endpoint then handles the data and returns either a success or failure response.

2. [Celo](https://celo.org/): Celo is a public blockchain that not only stores data but also supports on-chain verification of zk-proofs, allowing anyone to verify the correctness of the proof.
    - The contract repository: https://github.com/vivianjeng/my-self-ticket-contract
    - The contract is deployed at:
        - Celo Mainnet: [0xF4205f466De67CA37d820504eb3c81bb89081214](https://celoscan.io/address/0xF4205f466De67CA37d820504eb3c81bb89081214)
        - Cele Alfajores:[0x9C060e2200dF127cAb5E3d5Cc5824292604c1391](https://alfajores.celoscan.io/address/0x9C060e2200dF127cAb5E3d5Cc5824292604c1391)

3. [Polygon](https://polygon.technology/): Polygon is also a public blockchain that not only stores data but also supports on-chain verification of zk-proofs, allowing anyone to verify the correctness of the proof. Though it doesn't support [`IdentityVerificationHub` deployment by default](https://docs.self.xyz/contract-integration/deployed-contracts), we can still deploy these contracts with [Deployment instructions](https://github.com/selfxyz/self/blob/main/contracts/README.md#deployments).
    - The contract repository:https://github.com/vivianjeng/my-self-ticket-contract
    - The contract is deployed at:
        - Polygon Amoy: 
            - DeployHub#IdentityVerificationHubImplV1 - [0xDff0E2480a9528a2cD7A482C492b42510FeeEc4D](https://amoy.polygonscan.com/address/0xDff0E2480a9528a2cD7A482C492b42510FeeEc4D)
            - DeployHub#IdentityVerificationHub - [0x62F114d7AA792864c2CE340c4b03F967c94DE6E4](https://amoy.polygonscan.com/address/0x62F114d7AA792864c2CE340c4b03F967c94DE6E4)
            - MySelfTicket: [0xE76f72F976913dB1acE6B127F60dC2AB10C60633](https://amoy.polygonscan.com/address/0xE76f72F976913dB1acE6B127F60dC2AB10C60633)

## Features

1. **Login:** Users can simply use the Self Protocol app to log in to the My Self Ticket website.

2. **Browse Events:** All concert events are displayed on the main page. By clicking on an event, you can view more details, including the date and seating information.

3. **Buy Tickets:** After selecting the tickets, proceed to checkout to complete the purchase (WIP).

4. **Verify Ticket:** There is a staff-only page available exclusively on the day of the event. This page can be accessed by appending `/qr` to the event URL, for example:

```sh
https://my-self-ticket-ethtaipei.vercel.app/events/cm94cxq2n00a3clvhaq8g47ek
```

becomes

```sh
https://my-self-ticket-ethtaipei.vercel.app/events/cm94cxq2n00a3clvhaq8g47ek/qr
```

## Prerequisites

-   Node.js 18+ and npm/yarn
-   PostgreSQL database

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticket_selling?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Self Protocol
SELF_ENDPOINT=
NEXT_PUBLIC_SELF_ENDPOINT=

# Ethereum
PRIVATE_KEY=
RPC_URL=
CONTRACT_ADDRESS=
```

## Getting Started

1. Install dependencies:

    ```bash
    yarn install
    ```

2. Set up the database:

    ```bash
    yarn prisma generate
    yarn prisma db push
    yarn prisma:seed
    ```

3. Start the development server:

    ```bash
    yarn dev
    ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
