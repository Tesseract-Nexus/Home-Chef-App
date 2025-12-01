// apps/web/src/app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define types
interface Order {
    ID: number;
    OrderDate: string;
    TotalAmount: number;
    Status: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      // NOTE: Placeholder for auth
      const token = 'placeholder_jwt';
      const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
      }
      setIsLoading(false);
    };

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading your orders...</div>;
  }
  
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', paddingTop: '50px' }}>
      <h1>My Orders</h1>
      {orders.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {orders.map((order) => (
            <li key={order.ID} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
              <Link href={`/orders/${order.ID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div>
                  <strong>Order #{order.ID}</strong>
                  <p>Date: {new Date(order.OrderDate).toLocaleDateString()}</p>
                  <p>Total: ${order.TotalAmount.toFixed(2)}</p>
                  <p>Status: <span style={{ fontWeight: 'bold' }}>{order.Status}</span></p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not placed any orders yet.</p>
      )}
    </div>
  );
}
