// apps/web/src/app/chef/menu/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@homechef/ui';

// Define the type for a menu item, matching the backend model
interface MenuItem {
    ID: number;
    Name: string;
    Description: string;
    Price: number;
    IsAvailable: boolean;
}

export default function ChefMenuPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'chef') {
      router.push('/');
      return;
    }

    const fetchMenuItems = async () => {
      if (session?.user?.id) {
        setIsLoading(true);
        // NOTE: This fetch call requires authentication. The 'Authorization' header
        // needs to be set with the user's JWT. This is a placeholder implementation
        // as the JWT is not currently exposed to the client-side session.
        const token = 'placeholder_jwt';

        const res = await fetch(`/api/menu/my-menu`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMenuItems(data.menuItems || []);
        }
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchMenuItems();
    }
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading menu...</div>;
  }

  if (session && session.user?.role === 'chef') {
    return (
      <div style={{ maxWidth: '800px', margin: 'auto', paddingTop: '50px' }}>
        <h1>Manage Your Menu</h1>
        <Button onClick={() => alert('Open modal to add item')}>Add New Item</Button>
        <div style={{ marginTop: '20px' }}>
          {menuItems.length > 0 ? (
            <ul>
              {menuItems.map((item) => (
                <li key={item.ID} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                  <strong>{item.Name}</strong> - ${item.Price.toFixed(2)}
                  <p>{item.Description}</p>
                  <small>Status: {item.IsAvailable ? 'Available' : 'Not Available'}</small>
                  <div style={{ marginTop: '5px' }}>
                    <Button onClick={() => alert(`Edit item ${item.ID}`)}>Edit</Button>
                    <Button onClick={() => alert(`Delete item ${item.ID}`)} style={{ marginLeft: '10px', backgroundColor: 'red' }}>Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven't added any menu items yet.</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
