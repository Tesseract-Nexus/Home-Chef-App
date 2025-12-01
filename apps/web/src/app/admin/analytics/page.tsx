// apps/web/src/app/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define types
interface Summary {
    totalUsers: number;
    totalChefs: number;
    totalOrders: number;
    totalRevenue: number;
}
interface SalesData {
    date: string;
    sales: number;
}

const StatCard = ({ title, value }: { title: string, value: string | number }) => (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: 0, color: '#555' }}>{title}</h3>
        <p style={{ fontSize: '2em', margin: '10px 0 0 0', fontWeight: 'bold' }}>{value}</p>
    </div>
);

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sales, setSales] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
        setIsLoading(true);
        const token = 'placeholder_jwt'; // NOTE: Placeholder for auth
        const [summaryRes, salesRes] = await Promise.all([
            fetch('/api/analytics/summary', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/analytics/sales', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (summaryRes.ok) {
            const data = await summaryRes.json();
            setSummary(data.summary);
        }
        if (salesRes.ok) {
            const data = await salesRes.json();
            // Format date for display
            const formattedSales = data.sales.map((s: SalesData) => ({
                ...s,
                date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }));
            setSales(formattedSales);
        }
        setIsLoading(false);
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router, session]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading Analytics...</div>;
  }
  
  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', paddingTop: '50px' }}>
      <h1>Analytics Dashboard</h1>
      
      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <StatCard title="Total Users" value={summary?.totalUsers ?? 0} />
        <StatCard title="Total Chefs" value={summary?.totalChefs ?? 0} />
        <StatCard title="Total Orders" value={summary?.totalOrders ?? 0} />
        <StatCard title="Total Revenue" value={`$${(summary?.totalRevenue ?? 0).toFixed(2)}`} />
      </div>

      {/* Sales Chart */}
      <h2 style={{ marginTop: '40px' }}>Sales Over Last 7 Days</h2>
      <div style={{ height: '400px', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Sales (USD)" />
              </BarChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}
