// apps/web/src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define types
interface UserProfile {
    Name: string;
    Email: string;
    Points: number;
    Role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      // NOTE: Placeholder for auth
      const token = 'placeholder_jwt';
      const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
      }
      setIsLoading(false);
    };

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading your profile...</div>;
  }
  
  if (!profile) {
      return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Could not load profile.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', paddingTop: '50px' }}>
      <h1>My Profile</h1>
      <div>
        <p><strong>Name:</strong> {profile.Name}</p>
        <p><strong>Email:</strong> {profile.Email}</p>
        <p><strong>Role:</strong> {profile.Role}</p>
        <p><strong>Loyalty Points:</strong> <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{profile.Points}</span></p>
      </div>

      {/* A simple link to the chef dashboard if the user is a chef */}
      {profile.Role === 'chef' && (
        <div style={{ marginTop: '20px' }}>
            <Link href="/chef/dashboard">Go to Chef Dashboard</Link>
        </div>
      )}
    </div>
  );
}
