// apps/web/src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@homechef/ui';

// Define types
interface User {
    ID: number;
    Name: string;
    Email: string;
    Role: string;
}
interface ChefProfile {
    ID: number;
    UserID: number;
    KitchenName: string;
    IsVerified: boolean;
    User: User;
}
interface Review {
    ID: number;
    Rating: number;
    Comment: string;
    User: { Name: string; };
    ChefProfile: { KitchenName: string; };
}

const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const thStyle = { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' };
const tdStyle = { border: '1px solid #ddd', padding: '8px' };

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [chefs, setChefs] = useState<ChefProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const token = 'placeholder_jwt'; // NOTE: Placeholder for auth
    const [usersRes, chefsRes, reviewsRes] = await Promise.all([
      fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/admin/chefs', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/reviews/admin/pending', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);

    if (usersRes.ok) {
      const data = await usersRes.json();
      setUsers(data.users || []);
    }
    if (chefsRes.ok) {
      const data = await chefsRes.json();
      setChefs(data.chefs || []);
    }
    if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviews(data.reviews || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
      return;
    }
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router, session]);

  const handleVerifyChef = async (profileId: number) => {
    const token = 'placeholder_jwt';
    await fetch(`/api/admin/chefs/${profileId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData(); // Refetch data
  };

  const handleSuspendUser = async (userId: number) => {
    if (confirm('Are you sure you want to suspend this user? This action is irreversible.')) {
        const token = 'placeholder_jwt';
        await fetch(`/api/admin/users/${userId}/suspend`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchData(); // Refetch data
    }
  };

  const handleUpdateReviewStatus = async (reviewId: number, status: 'approved' | 'rejected') => {
      const token = 'placeholder_jwt';
      await fetch(`/api/reviews/admin/${reviewId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status }),
      });
      fetchData(); // Refetch all admin data
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading Admin Dashboard...</div>;
  }
  
  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', paddingTop: '50px', paddingBottom: '50px' }}>
      <h1>Admin Dashboard</h1>

      {/* Reviews Table */}
      <h2 style={{ marginTop: '30px' }}>Pending Reviews ({reviews.length})</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Chef</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Rating</th>
            <th style={thStyle}>Comment</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(review => (
            <tr key={review.ID}>
              <td style={tdStyle}>{review.ChefProfile.KitchenName}</td>
              <td style={tdStyle}>{review.User.Name}</td>
              <td style={tdStyle}>{review.Rating}/5</td>
              <td style={tdStyle}>{review.Comment}</td>
              <td style={tdStyle}>
                <Button onClick={() => handleUpdateReviewStatus(review.ID, 'approved')} style={{ backgroundColor: 'green' }}>Approve</Button>
                <Button onClick={() => handleUpdateReviewStatus(review.ID, 'rejected')} style={{ marginLeft: '10px', backgroundColor: 'red' }}>Reject</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chefs Table */}
      <h2 style={{ marginTop: '30px' }}>Chef Profiles</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Kitchen Name</th>
            <th style={thStyle}>Chef Name</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {chefs.map(chef => (
            <tr key={chef.ID}>
              <td style={tdStyle}>{chef.KitchenName}</td>
              <td style={tdStyle}>{chef.User.Name}</td>
              <td style={tdStyle}>{chef.IsVerified ? 'Verified' : 'Not Verified'}</td>
              <td style={tdStyle}>
                {!chef.IsVerified && <Button onClick={() => handleVerifyChef(chef.ID)}>Verify</Button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Users Table */}
      <h2 style={{ marginTop: '30px' }}>All Users</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>User ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.ID}>
              <td style={tdStyle}>{user.ID}</td>
              <td style={tdStyle}>{user.Name}</td>
              <td style={tdStyle}>{user.Email}</td>
              <td style={tdStyle}>{user.Role}</td>
              <td style={tdStyle}>
                <Button onClick={() => handleSuspendUser(user.ID)} style={{ backgroundColor: 'red' }}>Suspend</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
