'use client';

import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { use2FA } from '@/hooks/use2fa';

const MAX_ATTEMPTS = 3;

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onVerified: (valid: boolean) => void;
};

export const Verify2FA: React.FC<Props> = ({ open, setOpen, onVerified }) => {
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const { verifyAsync } = use2FA();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();

    const code = new FormData(e.currentTarget).get('code') as string;

    const isValidCode = code && code.length === 6 && Number(code) && Number(code) > 0;

    if (!isValidCode) {
      setError('Invalid format, must be a 6 digit number');
      return;
    }

    const ok = await verifyAsync(code);

    if (!ok) {
      setAttempts(attempts => {
        const newAttempts = attempts + 1;

        if (newAttempts >= MAX_ATTEMPTS) {
          setOpen(false);
          setAttempts(0);
          onVerified(false);
        } else {
          setError('Invalid code');
        }

        return newAttempts;
      });
    } else {
      setOpen(false);
      setAttempts(0);
      onVerified(true);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
            {error ? (
              <span className="text-destructive">
                {error} {`(${MAX_ATTEMPTS - attempts} attempts left)`}
              </span>
            ) : null}
          </Label>
          <AlertDialogFooter>
            <Button type="submit">Confirm</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
