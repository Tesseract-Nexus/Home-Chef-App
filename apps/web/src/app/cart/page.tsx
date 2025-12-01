// apps/web/src/app/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@homechef/ui';

// Define types
interface MenuItem {
    Name: string;
    Price: number;
}
interface CartItem {
    ID: number;
    MenuItemID: number;
    MenuItem: MenuItem;
    Quantity: number;
}
interface Cart {
    ID: number;
    UserID: number;
    CartItems: CartItem[];
}

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    // NOTE: Placeholder for auth
    const token = 'placeholder_jwt';
    const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchCart();
    }
  }, [status, router]);

  const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
    const token = 'placeholder_jwt';
    await fetch(`/api/cart/item/${cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantity }),
    });
    fetchCart(); // Refetch cart to show updated state
  };

  const handleRemoveItem = async (cartItemId: number) => {
    const token = 'placeholder_jwt';
    await fetch(`/api/cart/item/${cartItemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchCart(); // Refetch cart
  };

  const handleCheckout = async () => {
    const token = 'placeholder_jwt';
    const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
        const data = await res.json();
        // Redirect to the payment page for the newly created order
        router.push(`/checkout/${data.order.ID}`);
    } else {
        const data = await res.json();
        alert(`Checkout failed: ${data.error}`);
    }
  };

  const calculateTotal = () => {
    return cart?.CartItems.reduce((total, item) => total + item.MenuItem.Price * item.Quantity, 0) || 0;
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading your cart...</div>;
  }
  
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', paddingTop: '50px' }}>
      <h1>Your Shopping Cart</h1>
      {cart && cart.CartItems.length > 0 ? (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cart.CartItems.map((item) => (
              <li key={item.ID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                <div>
                  <strong>{item.MenuItem.Name}</strong>
                  <p>${item.MenuItem.Price.toFixed(2)}</p>
                </div>
                <div>
                  <input 
                    type="number" 
                    value={item.Quantity}
                    onChange={(e) => handleUpdateQuantity(item.ID, parseInt(e.target.value))}
                    min="1"
                    style={{ width: '50px', marginRight: '10px', textAlign: 'center' }}
                  />
                  <Button onClick={() => handleRemoveItem(item.ID)} style={{ backgroundColor: 'red' }}>Remove</Button>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <h2>Total: ${calculateTotal().toFixed(2)}</h2>
            <Button onClick={handleCheckout} style={{ backgroundColor: 'green' }}>Proceed to Checkout</Button>
          </div>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
}
