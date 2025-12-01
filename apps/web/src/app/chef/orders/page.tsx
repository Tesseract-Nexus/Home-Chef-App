// apps/web/src/app/chef/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Define types
interface Order {
    ID: number;
    OrderDate: string;
    TotalAmount: number;
    Status: string;
    User: { Name: string; };
    DeliveryAddress: string;
}

const statusOptions = ["pending", "processing", "out_for_delivery", "delivered", "cancelled"];

export default function ChefOrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    // NOTE: Placeholder for auth
    const token = 'placeholder_jwt';
    const res = await fetch('/api/orders/chef', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'chef') {
        router.push('/');
        return;
    }
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const token = 'placeholder_jwt';
    await fetch(`/api/orders/chef/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders(); // Refetch to show the updated status
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading your orders...</div>;
  }
  
  return (
    <div style={{ maxWidth: '900px', margin: 'auto', paddingTop: '50px' }}>
      <h1>Your Orders</h1>
      {orders.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {orders.map((order) => (
            <li key={order.ID} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
              <div>
                <h3>Order #{order.ID}</h3>
                <p><strong>Customer:</strong> {order.User.Name}</p>
                <p><strong>Date:</strong> {new Date(order.OrderDate).toLocaleString()}</p>
                <p><strong>Total:</strong> ${order.TotalAmount.toFixed(2)}</p>
                <p><strong>Address:</strong> {order.DeliveryAddress}</p>
              </div>
              <div style={{ marginTop: '10px' }}>
                <label><strong>Status: </strong></label>
                <select 
                    value={order.Status}
                    onChange={(e) => handleStatusChange(order.ID, e.target.value)}
                >
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not received any orders yet.</p>
      )}
    </div>
  );
}
