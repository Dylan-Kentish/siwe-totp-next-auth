import { signOut } from 'next-auth/react';
import { useDisconnect } from 'wagmi';

export const useLogout = () => {
  const { disconnectAsync } = useDisconnect();

  async function logoutAsync(redirect?: boolean) {
    await disconnectAsync();
    await signOut({
      redirect,
    });
  }

  return { logoutAsync };
};
