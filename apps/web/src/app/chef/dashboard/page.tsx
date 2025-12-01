// apps/web/src/app/chef/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChefDashboardPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'chef')) {
        router.push('/');
    }

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', paddingTop: '50px' }}>
            <h1>Chef Dashboard</h1>
            <p>Welcome! Manage your kitchen and orders from here.</p>
            <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <Link href="/chef/profile" style={{ fontSize: '1.2em', textDecoration: 'underline' }}>Manage Your Profile</Link>
                <Link href="/chef/menu" style={{ fontSize: '1.2em', textDecoration: 'underline' }}>Manage Your Menu</Link>
                <Link href="/chef/orders" style={{ fontSize: '1.2em', textDecoration: 'underline' }}>View Your Orders</Link>
            </div>
        </div>
    );
}
