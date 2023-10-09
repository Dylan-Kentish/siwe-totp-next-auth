'use client';

import { useEffect, useState } from 'react';

import { signIn, useSession } from 'next-auth/react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Verify2FA = () => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmCode(code: string) {
    const result = await signIn('2fa', {
      code: code,
      redirect: false,
    });

    if (!result?.ok) {
      setError('Invalid code');
    } else {
      setOpen(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();

    const code = new FormData(e.currentTarget).get('code') as string;

    if (code && code.length === 6 && Number(code) && Number(code) > 0) {
      await handleConfirmCode(code);
    } else {
      setError('Invalid code');
    }
  }

  useEffect(() => {
    if (!session?.user.is2FAVerified) {
      setOpen(true);
    }
  }, [session]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Verify 2FA</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>2FA Verification</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the code from your authenticator app to login.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Label className="flex flex-col gap-2">
            <span>Code</span>
            <Input name="code" type="text" placeholder="123456" />
            {error ? <span className="text-destructive">{error}</span> : null}
          </Label>
          <AlertDialogFooter>
            <Button type="submit">Confirm</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
