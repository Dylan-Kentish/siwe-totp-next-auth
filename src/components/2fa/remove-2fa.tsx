'use client';

import { useTransition } from 'react';

import { remove } from '@/actions/2fa';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/useLogout';

import { use2FA } from './provider';

export const Remove2FA = () => {
  const [isPending, startTransition] = useTransition();
  const { logoutAsync } = useLogout();
  const { verify2FA } = use2FA({
    onVerified: async ok => {
      if (!ok) {
        await logoutAsync(false);
      } else {
        startTransition(() => {
          remove();
        });
      }
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          Remove 2FA
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove 2FA from your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={verify2FA}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
