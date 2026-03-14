import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Loader2,
  ShoppingBag,
  IndianRupee,
  UserX,
  UserCheck,
  Eye,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/services/api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  authProvider?: string;
  isActive: boolean;
  emailVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  createdAt: string;
}

interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter, page],
    queryFn: () =>
      apiClient.get<UsersResponse>('/admin/users', {
        search: search || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        page,
        limit: 20,
      }),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/admin/users/${id}/suspend`),
    onSuccess: () => {
      toast.success('User suspended');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
    },
    onError: () => toast.error('Failed to suspend user'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/admin/users/${id}/activate`),
    onSuccess: () => {
      toast.success('User activated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
    },
    onError: () => toast.error('Failed to activate user'),
  });

  const resp = data as unknown as UsersResponse | undefined;
  const users = resp?.data ?? [];
  const pagination = resp?.pagination;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-description">
          Manage all registered users on the platform
          {pagination && <span className="ml-1 font-medium">({pagination.total} total)</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="chef">Chef</option>
            <option value="delivery">Delivery</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-semibold text-primary">
                            {(user.firstName?.[0] || user.email[0] || '?').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">via {user.authProvider || 'email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />{user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />{user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{user.totalOrders || 0}</span>
                      </div>
                      {user.lastOrderAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">Last: {formatRelative(user.lastOrderAt)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {(user.totalSpent || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge active={user.isActive} verified={user.emailVerified} /></td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        user={user}
                        onView={() => setSelectedUser(user)}
                        onSuspend={() => suspendMutation.mutate(user.id)}
                        onActivate={() => activateMutation.mutate(user.id)}
                      />
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-20 text-center text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrev}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

function ActionMenu({ user, onView, onSuspend, onActivate }: {
  user: User;
  onView: () => void;
  onSuspend: () => void;
  onActivate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-secondary transition-colors">
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card shadow-elevated py-1">
          <button onClick={() => { onView(); setOpen(false); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary">
            <Eye className="h-4 w-4" />View Details
          </button>
          {user.isActive ? (
            <button onClick={() => { onSuspend(); setOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10">
              <UserX className="h-4 w-4" />Suspend User
            </button>
          ) : (
            <button onClick={() => { onActivate(); setOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-success hover:bg-success/10">
              <UserCheck className="h-4 w-4" />Activate User
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
      <div className="w-full max-w-lg rounded-xl bg-card shadow-modal p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">User Details</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl font-bold text-primary">{(user.firstName?.[0] || '?').toUpperCase()}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{user.firstName} {user.lastName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
            <Detail label="Role" value={user.role} />
            <Detail label="Auth Provider" value={user.authProvider || 'email'} />
            <Detail label="Phone" value={user.phone || 'Not provided'} />
            <Detail label="Status" value={user.isActive ? 'Active' : 'Suspended'} />
            <Detail label="Email Verified" value={user.emailVerified ? 'Yes' : 'No'} />
            <Detail label="Joined" value={new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <Detail label="Total Orders" value={String(user.totalOrders || 0)} />
            <Detail label="Total Spent" value={`₹${(user.totalSpent || 0).toLocaleString('en-IN')}`} />
          </div>
          <p className="text-xs text-muted-foreground">User ID: {user.id}</p>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground capitalize">{value}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    customer: 'bg-info/10 text-info', chef: 'bg-primary/10 text-primary',
    delivery: 'bg-success/10 text-success', admin: 'bg-warning/10 text-warning',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[role] || 'bg-muted text-muted-foreground'}`}>{role}</span>;
}

function StatusBadge({ active, verified }: { active: boolean; verified: boolean }) {
  if (!active) return <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">Suspended</span>;
  if (verified) return <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">Active</span>;
  return <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">Unverified</span>;
}

function formatRelative(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
