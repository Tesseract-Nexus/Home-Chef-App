// apps/web/src/app/delivery/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@homechef/ui';

// Define types
interface Order {
    ID: number;
    Status: string;
    DeliveryAddress: string;
    ChefProfile: {
        KitchenName: string;
        Address: string; // Assuming chef profile has an address
        City: string;
        State: string;
    };
    User: { // The customer
        Name: string;
    };
}

export default function DriverDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignedOrders = async () => {
    const token = 'placeholder_jwt';
    const res = await fetch('/api/delivery/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'driver')) {
      router.push('/');
      return;
    }
    if (status === 'authenticated') {
      fetchAssignedOrders();
    }
  }, [status, router, session]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const token = 'placeholder_jwt';
    await fetch(`/api/delivery/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
    });
    fetchAssignedOrders(); // Refetch to show updated state
  };
  
  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading your assigned deliveries...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: 'auto', paddingTop: '50px' }}>
      <h1>My Deliveries</h1>
      {orders.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {orders.map(order => (
            <li key={order.ID} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
              <h3>Order #{order.ID}</h3>
              <div>
                <h4>Pickup Address</h4>
                <p>{order.ChefProfile.KitchenName}</p>
                <p>{order.ChefProfile.Address}, {order.ChefProfile.City}, {order.ChefProfile.State}</p>
              </div>
              <div style={{ margin: '15px 0', borderTop: '1px dashed #ccc' }}></div>
              <div>
                <h4>Delivery Address</h4>
                <p>Customer: {order.User.Name}</p>
                <p>{order.DeliveryAddress}</p>
              </div>
               <div style={{ marginTop: '20px' }}>
                <p>Current Status: <strong>{order.Status}</strong></p>
                {order.Status === 'processing' && (
                    <Button onClick={() => handleStatusChange(order.ID, 'out_for_delivery')} style={{ backgroundColor: '#007bff' }}>
                        Pick Up & Start Delivery
                    </Button>
                )}
                {order.Status === 'out_for_delivery' && (
                    <Button onClick={() => handleStatusChange(order.ID, 'delivered')} style={{ backgroundColor: 'green' }}>
                        Mark as Delivered
                    </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no assigned deliveries at the moment.</p>
      )}
    </div>
  );
}
