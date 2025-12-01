// apps/web/src/app/ads/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@homechef/ui';

// Define types
interface Ad {
    ID: number;
    Title: string;
    Content: string;
    ImageURL: string;
    TargetURL: string;
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  const { status } = useSession({ required: true, onUnauthenticated: () => router.push('/login') });
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for the 'Create Ad' form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [error, setError] = useState('');

  const fetchAds = async () => {
    if (!campaignId) return;
    setIsLoading(true);
    const res = await fetch(`/api/ads/campaign/${campaignId}`);
    if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAds();
    }
  }, [status, campaignId]);

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = 'placeholder_jwt';

    const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
            campaign_id: parseInt(campaignId),
            title, 
            content,
            image_url: imageUrl,
            target_url: targetUrl,
        }),
    });

    if (res.ok) {
      // Clear form and refetch ads
      setTitle(''); setContent(''); setImageUrl(''); setTargetUrl('');
      fetchAds();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create ad.');
    }
  };

  if (isLoading) {
    return <p>Loading campaign...</p>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: 'auto', paddingTop: '50px' }}>
      <h1>Campaign #{campaignId} - Ads</h1>
      
      {/* Create Ad Form */}
      <div style={{ margin: '30px 0', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
        <h3>Create a New Ad</h3>
        <form onSubmit={handleCreateAd}>
          <div style={{ marginBottom: '10px' }}><input type="text" placeholder="Ad Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px' }} /></div>
          <div style={{ marginBottom: '10px' }}><textarea placeholder="Ad Content" value={content} onChange={e => setContent(e.target.value)} required style={{ width: '100%', padding: '8px' }} /></div>
          <div style={{ marginBottom: '10px' }}><input type="text" placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required style={{ width: '100%', padding: '8px' }} /></div>
          <div style={{ marginBottom: '10px' }}><input type="text" placeholder="Target URL (e.g., /chefs/1)" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} required style={{ width: '100%', padding: '8px' }} /></div>
          <Button type="submit">Create Ad</Button>
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </form>
      </div>

      {/* Ads List */}
      <h2>Existing Ads</h2>
      <div style={{ marginTop: '20px' }}>
        {ads.map(ad => (
          <div key={ad.ID} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <h4 style={{ margin: 0 }}>{ad.Title}</h4>
            <p>{ad.Content}</p>
            <a href={ad.TargetURL} target="_blank" rel="noopener noreferrer">-> {ad.TargetURL}</a>
          </div>
        ))}
         {ads.length === 0 && <p>No ads have been created for this campaign yet.</p>}
      </div>
    </div>
  );
}
