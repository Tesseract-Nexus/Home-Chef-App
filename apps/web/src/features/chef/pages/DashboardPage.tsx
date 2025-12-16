import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingBag,
  Star,
  TrendingUp,
  Clock,
  ChefHat,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/shared/services/api-client';
import { useAuth } from '@/app/providers/AuthProvider';
import type { Order, PaginatedResponse } from '@/shared/types';

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  weeklyOrders: number;
  weeklyRevenue: number;
  rating: number;
  totalReviews: number;
  revenueChange: number;
  ordersChange: number;
}

export default function ChefDashboardPage() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['chef-dashboard-stats'],
    queryFn: () => apiClient.get<DashboardStats>('/chef/dashboard/stats'),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['chef-recent-orders'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Order>>('/chef/orders', {
        limit: 5,
        sort: 'createdAt',
        order: 'desc',
      }),
  });

  const { data: pendingOrders } = useQuery({
    queryKey: ['chef-pending-orders'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Order>>('/chef/orders', {
        status: 'pending,accepted',
        limit: 10,
      }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 text-gray-600">
          Here's what's happening with your kitchen today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value={`$${stats?.todayRevenue?.toFixed(2) || '0.00'}`}
          change={stats?.revenueChange}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Today's Orders"
          value={stats?.todayOrders?.toString() || '0'}
          change={stats?.ordersChange}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders?.toString() || '0'}
          icon={Clock}
          color="yellow"
          urgent={stats?.pendingOrders ? stats.pendingOrders > 0 : false}
        />
        <StatCard
          title="Your Rating"
          value={stats?.rating?.toFixed(1) || '0.0'}
          subtitle={`${stats?.totalReviews || 0} reviews`}
          icon={Star}
          color="orange"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Orders */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Orders</h2>
            <Link
              to="/chef/orders"
              className="text-sm text-brand-600 hover:text-brand-700"
            >
              View all
            </Link>
          </div>

          {pendingOrders?.data.length === 0 ? (
            <div className="mt-6 text-center py-8">
              <ChefHat className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-gray-500">No pending orders</p>
              <p className="text-sm text-gray-400">New orders will appear here</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {pendingOrders?.data.slice(0, 4).map((order) => (
                <PendingOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                to="/chef/menu"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                  <ChefHat className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Manage Menu</p>
                  <p className="text-sm text-gray-500">Add or edit items</p>
                </div>
              </Link>
              <Link
                to="/chef/orders"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Orders</p>
                  <p className="text-sm text-gray-500">Manage all orders</p>
                </div>
              </Link>
              <Link
                to="/chef/earnings"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Earnings</p>
                  <p className="text-sm text-gray-500">Track your income</p>
                </div>
              </Link>
              <Link
                to="/chef/social"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Social Feed</p>
                  <p className="text-sm text-gray-500">Share your creations</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-6 text-white">
            <h3 className="font-semibold">Pro Tip</h3>
            <p className="mt-2 text-brand-100">
              Customers love seeing photos of your dishes! Post on the social feed
              to increase visibility and attract more orders.
            </p>
            <Link
              to="/chef/social"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors"
            >
              Create a post
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link
            to="/chef/orders"
            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders?.data.map((order) => (
                <tr key={order.id} className="text-sm">
                  <td className="py-3">
                    <Link
                      to={`/chef/orders/${order.id}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 text-gray-600">
                    {order.items.length} item(s)
                  </td>
                  <td className="py-3 font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  color,
  urgent,
}: {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  icon: typeof DollarSign;
  color: 'green' | 'blue' | 'yellow' | 'orange';
  urgent?: boolean;
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className={`rounded-xl bg-white p-6 shadow-sm ${urgent ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <ArrowUpRight className={`h-4 w-4 ${change < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{subtitle || title}</p>
    </div>
  );
}

function PendingOrderCard({ order }: { order: Order }) {
  const isNew = order.status === 'pending';

  return (
    <Link
      to={`/chef/orders/${order.id}`}
      className={`flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
        isNew ? 'border-yellow-300 bg-yellow-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {isNew && (
          <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        )}
        <div>
          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
          <p className="text-sm text-gray-500">
            {order.items.length} items • ${order.total.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <OrderStatusBadge status={order.status} />
        <p className="mt-1 text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>
    </Link>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    pending: { label: 'New', color: 'bg-yellow-100 text-yellow-800' },
    accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800' },
    preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-800' },
    ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
    picked_up: { label: 'Picked Up', color: 'bg-cyan-100 text-cyan-800' },
    delivering: { label: 'Delivering', color: 'bg-orange-100 text-orange-800' },
    delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  };

  const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
