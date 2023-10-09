import 'server-only';

import { type NextAuthOptions, getServerSession as getServerSessionInternal } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import TwitterProvider from 'next-auth/providers/twitter';
import { getCsrfToken } from 'next-auth/react';
import { SiweMessage } from 'siwe';

import { env } from '@/env.mjs';
import { verifyToken } from '@/server/2fa';
import { prisma } from '@/server/db';

import { SIWEAdapter } from './adapter';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
  },
  adapter: SIWEAdapter(),
  providers: [
    CredentialsProvider({
      id: 'siwe',
      name: 'siwe',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials, req) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'));

          const nonce = await getCsrfToken({ req: { headers: req.headers } });

          const result = await siwe.verify({
            signature: credentials?.signature || '',
            domain: env.VERIFIED_DOMAIN,
            nonce,
          });

          if (result.success) {
            const user = await prisma.user.upsert({
              where: {
                id: siwe.address,
              },
              update: {},
              create: {
                id: siwe.address,
              },
              select: {
                id: true,
                role: true,
                TwoFactor: {
                  select: {
                    verified: true,
                  },
                },
              },
            });

            return {
              id: user.id,
              role: user.role,
              is2FAEnabled: user.TwoFactor ? user.TwoFactor.verified : false,
            };
          } else {
            return null;
          }
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: '2fa',
      name: '2fa',
      credentials: {
        code: {
          label: 'Code',
          type: 'text',
          placeholder: '123456',
        },
      },
      async authorize(credentials) {
        const session = await getServerSession();

        if (!session) {
          return null;
        }

        const code = credentials?.code || '';

        const valid = await verifyToken(code);

        if (!valid) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            id: session?.user.id,
          },
          select: {
            id: true,
            role: true,
            TwoFactor: {
              select: {
                verified: true,
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          role: user.role,
          is2FAEnabled: user.TwoFactor ? user.TwoFactor.verified : false,
          is2FAVerified: valid,
        };
      },
    }),
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: '2.0',
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Persist the data to the token right after authentication
        token.id = user.id;
        token.role = user.role;
        token.is2FAEnabled = user.is2FAEnabled;
        token.is2FAVerified = user.is2FAVerified;
      } else {
        const dbUser = await prisma.user.findUnique({
          where: {
            id: token.id,
          },
          select: {
            role: true,
            TwoFactor: {
              select: {
                verified: true,
              },
            },
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.is2FAEnabled = dbUser.TwoFactor ? dbUser.TwoFactor.verified : false;
        }
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.is2FAEnabled = token.is2FAEnabled;
      session.user.is2FAVerified = token.is2FAVerified;
      session.iat = token.iat;
      session.exp = token.exp;

      return session;
    },
  },
  events: {
    // after an account has been linked to a user
    // store the name and image from the provider
    linkAccount: async ({ account, profile }) => {
      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        data: {
          name: profile.name,
          image: profile.image,
        },
      });
    },
  },
  pages: {
    signIn: '/siwe',
  },
};

export async function getServerSession() {
  const session = await getServerSessionInternal(authOptions);

  return session;
}
