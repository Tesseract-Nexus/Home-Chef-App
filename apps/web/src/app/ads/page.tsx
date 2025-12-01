// apps/web/src/app/ads/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@homechef/ui';

// Define types
interface AdCampaign {
    ID: number;
    Name: string;
    Budget: number;
    IsActive: boolean;
}

export default function AdsDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      const token = 'placeholder_jwt'; // NOTE: Placeholder for auth
      const res = await fetch('/api/ads/campaigns', {
          headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
      setIsLoading(false);
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading Ad Manager...</div>;
  }
  
  return (
    <div style={{ maxWidth: '900px', margin: 'auto', paddingTop: '50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Ad Campaigns</h1>
        <Link href="/ads/new">
            <Button>Create Campaign</Button>
        </Link>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        {campaigns.length > 0 ? (
          <ul>
            {campaigns.map((campaign) => (
              <li key={campaign.ID} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                <Link href={`/ads/${campaign.ID}`}>
                    <strong>{campaign.Name}</strong>
                </Link>
                <p>Budget: ${campaign.Budget.toFixed(2)}</p>
                <p>Status: {campaign.IsActive ? 'Active' : 'Paused'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not created any ad campaigns yet.</p>
        )}
      </div>
    </div>
  );
}
