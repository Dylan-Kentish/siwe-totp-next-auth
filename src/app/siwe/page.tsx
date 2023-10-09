'use client';

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SIWEPage: NextPage = () => {
  const { data: session } = useSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>SIWE</CardTitle>
        <CardDescription>
          Sign in with ethereum is the sign method used to identify users using their unique
          ethereum based wallets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {session ? (
          <p>
            You are currently <strong>signed in</strong>.
            <br />
            <br />
            You are registered as a <strong>{session.user.role}</strong>.
            <br />
            <br />
            This session is{' '}
            <strong>{session.user.is2FAVerified ? '2FA verified' : 'not 2FA verified'}</strong>.
          </p>
        ) : (
          <p>
            You are currently <strong>not signed in</strong>.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SIWEPage;
