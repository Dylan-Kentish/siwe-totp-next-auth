'use client';

import React, { Suspense } from 'react';

import { useSession } from 'next-auth/react';

import { Verify2FA } from './2fa/verify-2fa';
import { LoginButton } from './web3/login-button';
import { LogoutButton } from './web3/logout-button';

export const AccountButton: React.FC = () => {
  const { data: session } = useSession();

  return (
    <span>
      {session ? (
        <LogoutButton />
      ) : (
        <Suspense>
          <LoginButton />
        </Suspense>
      )}
      {session && session.user.is2FAEnabled && !session.user.is2FAVerified && (
        <Suspense fallback={<span />}>
          <Verify2FA />
        </Suspense>
      )}
    </span>
  );
};
