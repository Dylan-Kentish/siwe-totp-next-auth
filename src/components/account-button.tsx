'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { useWeb3Modal } from '@web3modal/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAccount, useDisconnect } from 'wagmi';

import { useLogin } from '@/hooks/useLogin';
import { useLogout } from '@/hooks/useLogout';

import { use2FA } from './2fa/provider';
import { Button } from './ui/button';

export const AccountButton: React.FC = () => {
  const path = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();
  const { open, isOpen } = useWeb3Modal();
  const { disconnectAsync } = useDisconnect();
  const { loginAsync } = useLogin();
  const { logoutAsync } = useLogout();

  const redirect = useCallback(() => {
    const callbackUrl = searchParams.get('callbackUrl') || `${path}?${searchParams}`;

    router.replace(callbackUrl, {
      scroll: false,
    });
  }, [path, router, searchParams]);

  const { verify2FA } = use2FA({
    onVerified: async ok => {
      if (!ok) {
        setDisabled(false);
        await logoutAsync(false);
      } else {
        redirect();
        setDisabled(false);
      }
    },
  });

  const [disabled, setDisabled] = useState(false);

  useAccount({
    onConnect: async ({ address }) => {
      if (!address || sessionStatus === 'loading') {
        return;
      }

      setDisabled(true);

      const ok = await loginAsync(address);

      if (!ok) {
        await disconnectAsync();
        setDisabled(false);
      }
    },
  });

  async function handleClick() {
    if (session) {
      await logoutAsync().catch(console.error);
    } else {
      open().catch(console.error);
    }
  }

  useEffect(() => {
    if (disabled && session) {
      if (session.user.is2FAEnabled && !session.user.is2FAVerified) {
        verify2FA().catch(console.error);
      } else {
        setDisabled(false);
        redirect();
      }
    }
  }, [redirect, session, verify2FA, disabled]);

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={sessionStatus === 'loading' || isOpen || disabled}
    >
      {session ? 'Logout' : 'Login'}
    </Button>
  );
};
