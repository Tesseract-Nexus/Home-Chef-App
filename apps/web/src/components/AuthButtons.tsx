// apps/web/src/components/AuthButtons.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@homechef/ui';

export default function AuthButtons() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        {session.user?.name} <br />
        <Button onClick={() => signOut()}>Sign out</Button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <Button onClick={() => signIn('google')}>Sign in with Google</Button>
      <Button onClick={() => signIn('facebook')}>Sign in with Facebook</Button>
    </>
  );
}
