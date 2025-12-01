// apps/web/src/app/chef/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@homechef/ui';

export default function ChefProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [kitchenName, setKitchenName] = useState('');
  const [bio, setBio] = useState('');
  // In a real implementation, you would expand this to all fields
  // e.g., const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Redirect if not authenticated or not a chef
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'chef') {
      router.push('/'); // Redirect non-chefs to the homepage
      return;
    }
    
    // Fetch existing profile data once the session is loaded
    const fetchProfile = async () => {
        if (session?.user?.id) {
            // NOTE: This fetch call assumes a proxy or a Next.js API route is set up 
            // to handle authentication and forward the request to the Go backend.
            // The actual token forwarding mechanism needs to be implemented.
            const res = await fetch(`/api/profiles/chef/${session.user.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.profile) {
                    setKitchenName(data.profile.kitchen_name || '');
                    setBio(data.profile.bio || '');
                }
            }
        }
    };

    if (status === 'authenticated') {
        fetchProfile();
    }

  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // NOTE: This is a placeholder for making an authenticated request.
    // In a real app, you would get the JWT from the session (if exposed)
    // or use a custom hook that handles API calls via a BFF (Backend-For-Frontend) route.
    const token = 'placeholder_jwt'; // This needs to be replaced with a real token.

    const res = await fetch('/api/profiles/chef', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ kitchenName, bio }),
    });

    if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update profile');
    } else {
        setSuccess('Profile updated successfully!');
    }
  };

  if (status === 'loading') {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading...</div>;
  }

  // Render the form only if the user is an authenticated chef
  if (session && session.user?.role === 'chef') {
    return (
      <div style={{ maxWidth: '600px', margin: 'auto', paddingTop: '50px' }}>
        <h1>Your Chef Profile</h1>
        <p>Manage your public-facing kitchen information here.</p>
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Kitchen Name</label>
            <input
              type="text"
              value={kitchenName}
              onChange={(e) => setKitchenName(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Bio / Description</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ width: '100%', padding: '8px', minHeight: '120px' }}
            />
          </div>
          
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}

          <Button type="submit">Save Profile</Button>
        </form>
      </div>
    );
  }

  // Fallback for when the user is authenticated but not a chef (should be handled by redirect, but good for safety)
  if (status === 'authenticated' && session?.user?.role !== 'chef') {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>You are not authorized to view this page.</div>
  }

  return null; // Or a general "Not authorized" message
}
