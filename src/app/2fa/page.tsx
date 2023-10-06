import { NextPage } from 'next';

import { Setup2FA } from '@/components/2fa/setup';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { getServerSession } from '../api/auth/options';

const Page: NextPage = async () => {
  const session = await getServerSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>2FA</CardTitle>
        <CardDescription>
          Adding 2FA to your account will make it more secure. Protecting your account with 2FA
          ensures that only you can access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          2FA: <strong>{session!.user.is2FAEnabled ? 'Enabled' : 'Disabled'}</strong>
        </p>
      </CardContent>
      {!session!.user.is2FAEnabled && (
        <CardFooter>
          <Setup2FA />
        </CardFooter>
      )}
    </Card>
  );
};

export default Page;
