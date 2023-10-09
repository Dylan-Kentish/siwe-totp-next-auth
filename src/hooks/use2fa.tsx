import { signIn } from 'next-auth/react';

export const use2FA = () => {
  async function verifyAsync(code: string) {
    const result = await signIn('2fa', {
      code,
      redirect: false,
    });

    if (!result?.ok) {
      console.error('Failed to verify 2FA code.');
    }

    return result?.ok ?? false;
  }

  return { verifyAsync };
};
