// apps/web/src/app/chefs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

// Define the types to match backend models
interface User {
    ID: number;
    Name: string;
}
interface ChefProfile {
    UserID: number;
    KitchenName: string;
    Bio: string;
    City: string;
    State: string;
    User: User;
}

export default function ChefsPage() {
  const [profiles, setProfiles] = useState<ChefProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    const fetchChefs = async () => {
      setIsLoading(true);
      let url = '/api/profiles/chefs';
      const params = new URLSearchParams();

      if (searchQuery) {
        params.append('query', searchQuery);
      }
      if (cityFilter) {
        params.append('city', cityFilter);
      }

      if (params.toString()) {
        url = `${url}?${params.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
      }
      setIsLoading(false);
    };
    fetchChefs();
  }, [searchQuery, cityFilter]); // Re-fetch when search or city filter changes

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading chefs...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: 'auto', paddingTop: '50px' }}>
      <h1>Our Home Chefs</h1>
      <AdBanner />

      {/* Search and Filter Section */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by kitchen name or bio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1', minWidth: '200px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Filter by city..."
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          style={{ flex: '1', minWidth: '150px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <Link key={profile.UserID} href={`/chefs/${profile.UserID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', cursor: 'pointer' }}>
                <h2>{profile.KitchenName}</h2>
                <p>by {profile.User.Name}</p>
                <p style={{ fontStyle: 'italic', color: '#555' }}>{profile.City}, {profile.State}</p>
                <p style={{ marginTop: '10px' }}>{profile.Bio.substring(0, 100)}...</p>
              </div>
            </Link>
          ))
        ) : (
          <p>No verified chefs match your search criteria. Please try a different search!</p>
        )}
      </div>
    </div>
  );
}
