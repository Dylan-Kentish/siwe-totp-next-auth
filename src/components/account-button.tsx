'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { useWeb3Modal } from '@web3modal/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAccount, useDisconnect } from 'wagmi';

import { useLogin } from '@/hooks/useLogin';
import { useLogout } from '@/hooks/useLogout';

import { Verify2FA } from './2fa/verify-2fa';
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

  const [open2FA, setOpen2FA] = useState(false);
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

  const redirect = useCallback(() => {
    const callbackUrl = searchParams.get('callbackUrl') || `${path}?${searchParams}`;

    router.replace(callbackUrl, {
      scroll: false,
    });
  }, [path, router, searchParams]);

  async function handleClick() {
    if (session) {
      await logoutAsync().catch(console.error);
    } else {
      open().catch(console.error);
    }
  }

  function handle2FAVerified(valid: boolean) {
    if (valid) {
      redirect();
    } else {
      logoutAsync().catch(console.error);
    }
    setDisabled(false);
  }

  useEffect(() => {
    if (session) {
      if (session.user.is2FAEnabled && !session.user.is2FAVerified) {
        setOpen2FA(true);
      } else {
        setDisabled(false);
        redirect();
      }
    }
  }, [redirect, session]);

  return (
    <span>
      <Button
        size="lg"
        onClick={handleClick}
        disabled={sessionStatus === 'loading' || isOpen || disabled || open2FA}
      >
        {session ? 'Logout' : 'Login'}
      </Button>
      <Verify2FA open={open2FA} setOpen={setOpen2FA} onVerified={handle2FAVerified} />
    </span>
  );
};
