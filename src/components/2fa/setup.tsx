'use client';

import { useEffect, useState, useTransition } from 'react';

import Image from 'next/image';

import { create, verify } from '@/actions/2fa';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Skeleton } from '../ui/skeleton';

const MAX_ATTEMPTS = 3;

const ScanQRCode: React.FC<{ next: () => void }> = ({ next }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    create().then(data => {
      setImageUrl(data);
    });
  }, []);

  return (
    <>
      <DialogHeader>
        <DialogTitle>2FA Setup</DialogTitle>
        <DialogDescription>
          Scan this QR code with your authenticator app to add your account to it.
        </DialogDescription>
      </DialogHeader>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="2FA qr-code"
          className="mx-auto h-64 w-64 object-fill"
          width={256}
          height={256}
          unoptimized={true}
        />
      ) : (
        <Skeleton className="mx-auto h-64 w-64" />
      )}

      <DialogFooter>
        <Button onClick={next}>Next</Button>
      </DialogFooter>
    </>
  );
};

const ConfirmCode: React.FC<{ next: (ok: boolean) => void }> = ({ next }) => {
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = new FormData(e.currentTarget).get('code') as string;

    if (code && code.length === 6 && Number(code) && Number(code) > 0) {
      startTransition(() =>
        verify(code).then(valid => {
          if (valid) {
            next(true);
          } else {
            const newAttempts = attempts + 1;
            if (newAttempts >= MAX_ATTEMPTS) {
              next(false);
            } else {
              setError(`Invalid code, ${MAX_ATTEMPTS - newAttempts} attempts remaining`);
              setAttempts(newAttempts);
            }
          }
        })
      );
    } else {
      setError('Invalid format, must be a 6 digit number');
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>2FA Setup</DialogTitle>
        <DialogDescription>
          Enter the code from your authenticator app to confirm that 2FA is working.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Label className="flex flex-col gap-2">
          <span>Code</span>
          <Input name="code" type="text" placeholder="123456" />
          {error ? <span className="text-destructive">{error}</span> : null}
        </Label>
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            Confirm
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const Setup2FA: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'scan' | 'confirm'>('scan');

  function handleConfirmCode(ok: boolean) {
    if (ok) {
      setOpen(false);
    } else {
      setStage('scan');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button variant="outline">Setup 2FA</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-2 sm:max-w-[425px]">
        {stage === 'scan' ? (
          <ScanQRCode next={() => setStage('confirm')} />
        ) : (
          <ConfirmCode next={handleConfirmCode} />
        )}
      </DialogContent>
    </Dialog>
  );
};
