'use client';

import React, { PropsWithChildren } from 'react';

import { SessionProvider } from 'next-auth/react';

import { TwoFactorProvider } from './2fa/provider';
import { EthereumProvider } from './web3/ethereum-provider';

export const Providers: React.FC<PropsWithChildren> = ({ children }) => (
  <SessionProvider>
    <EthereumProvider>
      <TwoFactorProvider>{children}</TwoFactorProvider>
    </EthereumProvider>
  </SessionProvider>
);
