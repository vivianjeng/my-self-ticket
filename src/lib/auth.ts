import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        passportNumber: { label: 'Passport Number', type: 'text' },
        dateOfBirth: { label: 'Date of Birth', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.passportNumber || !credentials?.dateOfBirth) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            passportNumber: credentials.passportNumber,
          }
        });

        if (!user || !user.dateOfBirth) {
          throw new Error('Invalid credentials');
        }

        const isCorrectDateOfBirth = await bcrypt.compare(
          credentials.dateOfBirth,
          user.dateOfBirth
        );

        if (!isCorrectDateOfBirth) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          passportNumber: user.passportNumber,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/register',
    // signUp: '/register',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
}; 