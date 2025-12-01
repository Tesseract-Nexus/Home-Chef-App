// apps/web/src/app/orders/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import ReviewForm from '@/components/ReviewForm'; // Import the new component

// Define types
interface OrderItem {
    MenuItem: { Name: string; };
    Quantity: number;
    PriceAtOrder: number;
}
interface ChefProfile {
    KitchenName: string;
    User: { Name: string; };
}
interface Order {
    ID: number;
    OrderDate: string;
    TotalAmount: number;
    Status: string;
    DeliveryAddress: string;
    OrderItems: OrderItem[];
    ChefProfile: ChefProfile;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { data: session, status } = useSession();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false); // To hide form after submission

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchOrder = async () => {
        if (id) {
            const token = 'placeholder_jwt';
            const res = await fetch(`/api/orders/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
            }
            setIsLoading(false);
        }
    };

    if (status === 'authenticated') {
      fetchOrder();
    }
  }, [status, router, id]);

  const handleReviewSubmitted = () => {
      setHasReviewed(true);
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading order details...</div>;
  }

  if (!order) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Order not found.</div>;
  }
  
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', paddingTop: '50px' }}>
      <h1>Order #{order.ID}</h1>
      <p><strong>Status:</strong> {order.Status}</p>
      <p><strong>Date:</strong> {new Date(order.OrderDate).toLocaleDateString()}</p>
      <p><strong>Chef:</strong> {order.ChefProfile.KitchenName}</p>
      <p><strong>Deliver to:</strong> {order.DeliveryAddress}</p>

      <h2 style={{ marginTop: '30px' }}>Items</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {order.OrderItems.map((item) => (
          <li key={item.MenuItem.Name} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}>
            <span>{item.MenuItem.Name} (x{item.Quantity})</span>
            <span>${(item.PriceAtOrder * item.Quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '20px', textAlign: 'right', fontWeight: 'bold' }}>
        <p>Total: ${order.TotalAmount.toFixed(2)}</p>
      </div>

      {order.Status === 'delivered' && !hasReviewed && (
          <ReviewForm orderId={order.ID} onReviewSubmit={handleReviewSubmitted} />
      )}
      {order.Status === 'delivered' && hasReviewed && (
          <p style={{ marginTop: '30px', color: 'green', fontWeight: 'bold' }}>Thank you for your review!</p>
      )}
    </div>
  );
}
