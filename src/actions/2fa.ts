'use server';

import { revalidatePath } from 'next/cache';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

import { getServerSession } from '@/app/api/auth/options';
import { verifyToken } from '@/server/2fa';
import { prisma } from '@/server/db';

const SERVICE_NAME = 'SIWE TOTP NEXT-AUTH EXAMPLE';

export async function create() {
  const session = await getServerSession();

  if (!session) {
    return null;
  }

  const authenticatorSecret = authenticator.generateSecret();

  try {
    await prisma.twoFactor.delete({
      where: {
        userId: session.user.id,
        verified: false,
      },
    });

    await prisma.twoFactor.create({
      data: {
        userId: session.user.id,
        secret: authenticatorSecret,
      },
    });

    const otpauth = authenticator.keyuri(session.user.id, SERVICE_NAME, authenticatorSecret);

    const imageUrl = await qrcode.toDataURL(otpauth);

    return imageUrl;
  } catch (error: unknown) {
    // if the error is a unique constraint error, throw a new error
    // with a more user friendly message
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new Error('You cannot have more than one 2FA secret');
    } else {
      throw error;
    }
  }
}

export async function verify(token: string) {
  const session = await getServerSession();

  if (!session) {
    return false;
  }
  const valid = verifyToken(token);

  if (!valid) {
    return false;
  }

  await prisma.twoFactor.update({
    where: {
      userId: session.user.id,
    },
    data: {
      verified: true,
    },
  });

  revalidatePath('/2fa');

  return true;
}
