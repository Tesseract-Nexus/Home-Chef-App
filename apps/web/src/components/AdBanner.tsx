// apps/web/src/components/AdBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Ad {
    ID: number;
    Title: string;
    Content: string;
    ImageURL: string;
    TargetURL: string;
}

export default function AdBanner() {
    const [ad, setAd] = useState<Ad | null>(null);

    useEffect(() => {
        const fetchAd = async () => {
            const res = await fetch('/api/ads/serve');
            if (res.ok) {
                const data = await res.json();
                setAd(data.ad);
            }
        };
        fetchAd();
    }, []);

    if (!ad) {
        return null; // Don't render anything if there's no ad
    }

    return (
        <div style={{ border: '1px solid #007bff', padding: '15px', margin: '20px 0', backgroundColor: '#f0f8ff' }}>
            <Link href={ad.TargetURL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <p style={{ fontSize: '0.8em', margin: 0, color: '#555' }}>Sponsored</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={ad.ImageURL} alt={ad.Title} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    <div>
                        <h4 style={{ margin: 0 }}>{ad.Title}</h4>
                        <p>{ad.Content}</p>
                    </div>
                </div>
            </Link>
        </div>
    );
}
