import { authenticator } from 'otplib';

import { getServerSession } from '@/app/api/auth/options';

import { prisma } from './db';

export async function verifyToken(token: string) {
  const session = await getServerSession();

  if (!session) {
    return null;
  }

  const secret = await prisma.twoFactor.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!secret) {
    return null;
  }

  return authenticator.check(token, secret.secret);
}
