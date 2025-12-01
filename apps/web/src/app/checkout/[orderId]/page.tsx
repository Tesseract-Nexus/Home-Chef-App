// apps/web/src/app/checkout/[orderId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useParams } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm'; // A new component to create

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// NOTE: This is your public Stripe key, not the secret key.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const params = useParams();
  const orderId = params.orderId;
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (!orderId) return;

    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
        // NOTE: Placeholder for auth
        const token = 'placeholder_jwt';
        const res = await fetch('/api/payments/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ order_id: parseInt(orderId as string) }),
        });
        const data = await res.json();
        setClientSecret(data.clientSecret);
    };

    createPaymentIntent();
  }, [orderId]);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', paddingTop: '50px' }}>
      <h1>Confirm your Payment</h1>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}
