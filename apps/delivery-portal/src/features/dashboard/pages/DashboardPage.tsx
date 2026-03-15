import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/services/api-client';
import { Link } from 'react-router-dom';
import { Navigation, Package, DollarSign, Star, TrendingUp, Truck, Power } from 'lucide-react';
import type { DashboardStats } from '@/shared/types';
import { toast } from 'sonner';
import { PageLoader } from '@/shared/components/LoadingScreen';

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['delivery-stats'],
    queryFn: () => apiClient.get<DashboardStats>('/delivery/stats'),
    refetchInterval: 15000,
  });

  const toggleOnline = useMutation({
    mutationFn: (isOnline: boolean) => apiClient.put('/delivery/online', { isOnline }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] });
      toast.success(stats?.partner?.isOnline ? 'You are now offline' : 'You are now online');
    },
    onError: () => toast.error('Failed to update status'),
  });

  if (isLoading) return <PageLoader />;

  const isOnline = stats?.partner?.isOnline ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Welcome back, partner</p>
        </div>
        <button
          onClick={() => toggleOnline.mutate(!isOnline)}
          disabled={toggleOnline.isPending}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
            isOnline
              ? 'bg-success text-success-foreground shadow-md'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <Power className="h-4 w-4" />
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {!isOnline && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-center">
          <p className="text-sm font-medium text-warning">
            You are currently offline. Go online to receive delivery requests.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span className="text-xs font-medium">Today</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats?.today?.deliveries ?? 0}</p>
          <p className="text-xs text-muted-foreground">deliveries</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">Today's Earnings</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            ${(stats?.today?.earnings ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">This Week</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            ${(stats?.week?.earnings ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">{stats?.week?.deliveries ?? 0} deliveries</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-4 w-4" />
            <span className="text-xs font-medium">Rating</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {(stats?.partner?.rating ?? 0).toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">{stats?.totalReviews ?? 0} reviews</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(stats?.active ?? 0) > 0 && (
          <Link
            to="/active"
            className="flex items-center gap-4 rounded-xl border-2 border-primary bg-primary/5 p-5 transition-colors hover:bg-primary/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Navigation className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Active Delivery</p>
              <p className="text-sm text-muted-foreground">You have an ongoing delivery</p>
            </div>
          </Link>
        )}

        <Link
          to="/available"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
            <Package className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Available Orders</p>
            <p className="text-sm text-muted-foreground">
              {stats?.availableOrders ?? 0} orders waiting
            </p>
          </div>
        </Link>
      </div>

      {/* Monthly Summary */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">This Month</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{stats?.month?.deliveries ?? 0}</p>
            <p className="text-xs text-muted-foreground">Deliveries</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              ${(stats?.month?.earnings ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats?.totalDeliveries ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total All Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
