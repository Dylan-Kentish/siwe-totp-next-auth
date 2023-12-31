// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth';

type Role = 'ADMIN' | 'USER';

declare module 'next-auth/adapters' {
  interface AdapterUser {
    id: string;
  }
}

declare module 'next-auth' {
  interface User {
    id: string;
    role: Role;
    is2FAEnabled: boolean;
    is2FAVerified?: boolean;
  }

  interface Session {
    user: User;
    iat: number;
    exp: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    is2FAEnabled: boolean;
    is2FAVerified?: boolean;
    iat: number;
    exp: number;
  }
}
