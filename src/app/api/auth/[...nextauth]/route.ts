import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        passportNumber: { label: "Passport Number", type: "text" },
        dateOfBirth: { label: "Date of Birth", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.passportNumber || !credentials?.dateOfBirth) {
          throw new Error("no passport number or date of birth");
        }

        const user = await prisma.user.findUnique({
          where: {
            passportNumber: credentials.passportNumber
          }
        });

        if (!user || !user.dateOfBirth) {
          throw new Error("user not found");
        }

        console.log(user.dateOfBirth, credentials.dateOfBirth);

        if (user.dateOfBirth !== credentials.dateOfBirth) {
          throw new Error("date of birth is incorrect");
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
    strategy: "jwt"
  },
  pages: {
    signUp: "/register",
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
});

export { handler as GET, handler as POST }; 