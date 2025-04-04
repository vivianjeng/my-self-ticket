# TicketHub - Event Ticket Selling Platform

A modern web application for buying and selling event tickets. Built with Next.js, TypeScript, Tailwind CSS, and Stripe integration.

## Features

- User authentication (sign up, login, logout)
- Browse available events
- Select seats and purchase tickets
- Secure payment processing with Stripe
- View purchased tickets
- Responsive design for all devices

## Tech Stack

- **Frontend:**
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui components
  - React Hook Form
  - Zustand (state management)

- **Backend:**
  - Next.js API Routes
  - Prisma (ORM)
  - PostgreSQL
  - NextAuth.js
  - Stripe

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Stripe account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticket_selling?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Stripe
STRIPE_PUBLIC_KEY="your-stripe-public-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tickethub.git
   cd tickethub
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up the database:
   ```bash
   yarn prisma generate
   yarn prisma db push
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── events/            # Event pages
│   ├── login/             # Authentication pages
│   ├── my-tickets/        # User tickets page
│   └── success/           # Payment success page
├── components/            # React components
├── lib/                   # Utility functions and configurations
├── providers/             # Context providers
└── hooks/                 # Custom React hooks
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
