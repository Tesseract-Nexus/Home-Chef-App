import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  CheckCircle,
  XCircle,
  Package,
  Loader2,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/services/api-client';
import type { Order, OrderStatus, PaginatedResponse } from '@/shared/types';

const STATUS_TABS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'New' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; nextAction?: string; nextStatus?: OrderStatus }> = {
  pending: { label: 'New Order', color: 'bg-yellow-100 text-yellow-800', nextAction: 'Accept', nextStatus: 'accepted' },
  accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800', nextAction: 'Start Preparing', nextStatus: 'preparing' },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-800', nextAction: 'Mark Ready', nextStatus: 'ready' },
  ready: { label: 'Ready for Pickup', color: 'bg-green-100 text-green-800' },
  picked_up: { label: 'Picked Up', color: 'bg-cyan-100 text-cyan-800' },
  delivering: { label: 'Delivering', color: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function ChefOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['chef-orders', statusFilter],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') {
        if (statusFilter === 'completed') {
          params.status = 'delivered,cancelled';
        } else {
          params.status = statusFilter;
        }
      }
      return apiClient.get<PaginatedResponse<Order>>('/chef/orders', params);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      apiClient.put(`/chef/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chef-orders'] });
      toast.success('Order status updated');
      setSelectedOrder(null);
    },
    onError: () => {
      toast.error('Failed to update order status');
    },
  });

  const orders = data?.data || [];
  const filteredOrders = searchQuery
    ? orders.filter((order) =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-gray-600">
            Manage and track your incoming orders
          </p>
        </div>
        <button onClick={() => refetch()} className="btn-outline">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`relative rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-brand-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            {tab.value === 'pending' && pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order number..."
          className="input-base pl-10"
        />
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 font-medium text-gray-900">No orders found</h3>
          <p className="mt-2 text-gray-600">
            {statusFilter === 'all'
              ? "You don't have any orders yet"
              : `No ${statusFilter} orders`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onSelect={() => setSelectedOrder(order)}
              onUpdateStatus={(status) =>
                updateStatusMutation.mutate({ orderId: order.id, status })
              }
              isUpdating={updateStatusMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={(status) =>
            updateStatusMutation.mutate({ orderId: selectedOrder.id, status })
          }
          isUpdating={updateStatusMutation.isPending}
        />
      )}
    </div>
  );
}

function OrderCard({
  order,
  onSelect,
  onUpdateStatus,
  isUpdating,
}: {
  order: Order;
  onSelect: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
  isUpdating: boolean;
}) {
  const status = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-800' };
  const isNew = order.status === 'pending';

  return (
    <div
      className={`rounded-xl bg-white shadow-sm overflow-hidden ${
        isNew ? 'ring-2 ring-yellow-400' : ''
      }`}
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Order Info */}
          <div className="flex items-start gap-4">
            {isNew && (
              <span className="mt-1 flex h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
            )}
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onSelect}
                  className="text-lg font-semibold text-gray-900 hover:text-brand-600"
                >
                  #{order.orderNumber}
                </button>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
            <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
          </div>
        </div>

        {/* Items Preview */}
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <ul className="space-y-1 text-sm">
            {order.items.slice(0, 3).map((item) => (
              <li key={item.id} className="flex justify-between text-gray-600">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>${item.subtotal.toFixed(2)}</span>
              </li>
            ))}
            {order.items.length > 3 && (
              <li className="text-gray-400">+{order.items.length - 3} more items</li>
            )}
          </ul>
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <span className="font-medium">Note:</span> {order.specialInstructions}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-3">
          {status.nextAction && status.nextStatus && (
            <button
              onClick={() => onUpdateStatus(status.nextStatus!)}
              disabled={isUpdating}
              className="btn-primary"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : status.nextAction}
            </button>
          )}
          {order.status === 'pending' && (
            <button
              onClick={() => onUpdateStatus('cancelled')}
              disabled={isUpdating}
              className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          )}
          <button onClick={onSelect} className="btn-outline">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  isUpdating,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
  isUpdating: boolean;
}) {
  const status = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-20">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order #{order.orderNumber}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info - Anonymized per RBAC */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900">Delivery Information</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>
                  {order.deliveryAddress.line1}, {order.deliveryAddress.city},{' '}
                  {order.deliveryAddress.state} {order.deliveryAddress.postalCode}
                </span>
              </div>
              {order.deliveryAddress.deliveryInstructions && (
                <p className="text-gray-500 italic">
                  {order.deliveryAddress.deliveryInstructions}
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-medium text-gray-900">Order Items</h3>
            <div className="mt-3 divide-y rounded-lg border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.notes && (
                      <p className="text-sm text-gray-500">Note: {item.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">x{item.quantity}</p>
                    <p className="text-sm text-gray-500">${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="rounded-lg bg-amber-50 p-4">
              <h3 className="font-medium text-amber-900">Special Instructions</h3>
              <p className="mt-2 text-sm text-amber-800">{order.specialInstructions}</p>
            </div>
          )}

          {/* Payment Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900">Payment Summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              {order.tip > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tip</span>
                  <span>${order.tip.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold text-gray-900">
                <span>Your Earnings</span>
                <span>${(order.subtotal - order.discount + order.tip).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3 border-t p-6">
          <button onClick={onClose} className="btn-outline">
            Close
          </button>
          <div className="flex gap-3">
            {order.status === 'pending' && (
              <button
                onClick={() => onUpdateStatus('cancelled')}
                disabled={isUpdating}
                className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
              >
                Reject Order
              </button>
            )}
            {status.nextAction && status.nextStatus && (
              <button
                onClick={() => onUpdateStatus(status.nextStatus!)}
                disabled={isUpdating}
                className="btn-primary"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {status.nextAction}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
