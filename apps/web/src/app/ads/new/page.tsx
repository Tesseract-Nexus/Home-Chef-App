// apps/web/src/app/ads/new/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@homechef/ui';

export default function NewCampaignPage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const [name, setName] = useState('');
  const [budget, setBudget] = useState(100);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = 'placeholder_jwt'; // NOTE: Placeholder for auth

    const res = await fetch('/api/ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
            name, 
            budget,
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
        }),
    });

    if (res.ok) {
      router.push('/ads');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create campaign.');
    }
  };
  
  if (status === 'loading') {
      return <p>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', paddingTop: '50px' }}>
      <h1>Create New Ad Campaign</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
            <label>Campaign Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
            <label>Budget (USD)</label>
            <input type="number" value={budget} onChange={e => setBudget(parseFloat(e.target.value))} required min="1" style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
            <label>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Button type="submit">Create Campaign</Button>
      </form>
    </div>
  );
}
