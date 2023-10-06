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
          className="h-64 w-64 object-fill"
          width={256}
          height={256}
          unoptimized={true}
        />
      ) : (
        <Skeleton className="h-64 w-64" />
      )}

      <DialogFooter>
        <Button onClick={next}>Next</Button>
      </DialogFooter>
    </>
  );
};

const ConfirmCode: React.FC<{ disabled: boolean; next: (code: string) => void }> = ({
  disabled,
  next,
}) => {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = new FormData(e.currentTarget).get('code') as string;

    if (code && code.length === 6 && Number(code) && Number(code) > 0) {
      next(code);
    } else {
      alert('Invalid code');
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
      <form onSubmit={handleSubmit}>
        <Label>
          <span>Code</span>
          <Input name="code" type="text" placeholder="123456" />
        </Label>
        <DialogFooter>
          <Button type="submit" disabled={disabled}>
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
  const [isPending, startTransition] = useTransition();

  function handleConfirmCode(code: string) {
    startTransition(() =>
      verify(code).then(valid => {
        if (valid) {
          setOpen(false);
        } else {
          setStage('scan');
        }
      })
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button variant="outline">Setup 2FA</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {stage === 'scan' ? (
          <ScanQRCode next={() => setStage('confirm')} />
        ) : (
          <ConfirmCode disabled={isPending} next={handleConfirmCode} />
        )}
      </DialogContent>
    </Dialog>
  );
};
