import { NextPage } from 'next';

import { Verify2FA } from '@/components/2fa/verify-2fa';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { getServerSession } from '../api/auth/options';

const SIWEPage: NextPage = async () => {
  const session = await getServerSession();

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
      {session && !session.user.is2FAVerified ? (
        <CardFooter>
          <Verify2FA />
        </CardFooter>
      ) : null}
    </Card>
  );
};

export default SIWEPage;
