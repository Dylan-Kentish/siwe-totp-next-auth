import { PropsWithChildren, createContext, useContext, useRef, useState } from 'react';

import { Verify2FA } from './verify-2fa';

type ContextProps = {
  verify2FA: () => Promise<boolean>;
};

const TwoFactorContext = createContext<ContextProps>({} as ContextProps);

export const TwoFactorProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);

  const resolveRef = useRef<(ok: boolean) => void>();

  function handleVerified(valid: boolean) {
    resolveRef.current?.(valid);
  }

  async function verify2FA() {
    return new Promise<boolean>(resolve => {
      resolveRef.current = resolve;

      setOpen(true);
    });
  }

  return (
    <TwoFactorContext.Provider value={{ verify2FA }}>
      {children}

      <Verify2FA open={open} setOpen={setOpen} onVerified={handleVerified} />
    </TwoFactorContext.Provider>
  );
};

type Options = {
  onVerified: (ok: boolean) => Promise<void>;
};

export const use2FA = (option: Options) => {
  const { verify2FA } = useContext(TwoFactorContext);

  function withOptions() {
    return verify2FA().then(option.onVerified);
  }
  return { verify2FA: withOptions };
};
