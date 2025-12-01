// apps/web/src/app/chefs/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@homechef/ui';

// Define the types to match backend models
interface User {
    Name: string;
}
interface ChefProfile {
    KitchenName: string;
    Bio: string;
    City: string;
    State: string;
    User: User;
}
interface MenuItem {
    ID: number;
    Name: string;
    Description: string;
    Price: number;
}
interface Review {
    ID: number;
    Rating: number;
    Comment: string;
    User: { Name: string; };
}

export default function ChefDetailPage() {
  const params = useParams();
  const id = params.id;
  const { data: session } = useSession();

  const [profile, setProfile] = useState<ChefProfile | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleAddToCart = async (menuItemId: number) => {
    if (!session) {
      alert('Please log in to add items to your cart.');
      return;
    }

    // NOTE: This requires a real JWT to be sent. Using a placeholder.
    const token = 'placeholder_jwt';

    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ menu_item_id: menuItemId, quantity: 1 }),
    });

    if (res.ok) {
      alert('Item added to cart!');
    } else {
      alert('Failed to add item to cart.');
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchChefData = async () => {
      setIsLoading(true);
      
      // Fetch profile, menu items, and reviews in parallel
      const [profileRes, menuRes, reviewsRes] = await Promise.all([
        fetch(`/api/profiles/chef/${id}`),
        fetch(`/api/menu/chef/${id}`),
        fetch(`/api/reviews/chef/${id}`)
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.profile);
      }

      if (menuRes.ok) {
        const data = await menuRes.json();
        setMenuItems(data.menuItems || []);
      }

      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviews(data.reviews || []);
      }

      setIsLoading(false);
    };

    fetchChefData();
  }, [id]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading chef's kitchen...</div>;
  }

  if (!profile) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Chef not found.</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: 'auto', paddingTop: '50px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1>{profile.KitchenName}</h1>
        <p>by {profile.User.Name}</p>
        <p style={{ fontStyle: 'italic', color: '#555' }}>{profile.City}, {profile.State}</p>
        <p style={{ marginTop: '10px' }}>{profile.Bio}</p>
      </header>

      <main>
        <h2>Menu</h2>
        <div style={{ marginTop: '20px' }}>
          {menuItems.length > 0 ? (
            <ul>
              {menuItems.map((item) => (
                <li key={item.ID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                  <div>
                    <strong>{item.Name}</strong> - ${item.Price.toFixed(2)}
                    <p>{item.Description}</p>
                  </div>
                  {session && <Button onClick={() => handleAddToCart(item.ID)}>Add to Cart</Button>}
                </li>
              ))}
            </ul>
          ) : (
            <p>This chef has not added any menu items yet.</p>
          )}
        </div>
      </main>

      <section style={{ marginTop: '40px' }}>
        <h2>What Customers Are Saying</h2>
        <div style={{ marginTop: '20px' }}>
          {reviews.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {reviews.map(review => (
                <li key={review.ID} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                  <strong>Rating: {review.Rating}/5</strong>
                  <p>"{review.Comment}"</p>
                  <small>- {review.User.Name}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>This chef has no reviews yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
