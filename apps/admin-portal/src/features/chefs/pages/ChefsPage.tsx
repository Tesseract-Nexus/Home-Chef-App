import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChefHat,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/shared/services/api-client';
import type { OnboardingStatus } from '@/shared/types';

interface Chef {
  id: string;
  userId: string;
  businessName: string;
  cuisines: string[];
  rating: number;
  totalOrders: number;
  verified: boolean;
  isOnline: boolean;
  onboardingStatus?: OnboardingStatus;
  createdAt: string;
}

export default function ChefsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: chefs, isLoading } = useQuery({
    queryKey: ['admin-chefs', search, statusFilter],
    queryFn: () =>
      apiClient.get<Chef[]>('/admin/chefs', {
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Chefs</h1>
        <p className="page-description">Manage and verify home chef registrations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chefs by name or cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="submitted">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Chefs Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chefs?.map((chef) => (
            <div key={chef.id} className="rounded-xl border border-border bg-card p-6 shadow-card card-hover-lift">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <ChefHat className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{chef.businessName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <OnboardingBadge status={chef.onboardingStatus} verified={chef.verified} />
                      {chef.isOnline && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <span className="h-1.5 w-1.5 rounded-full bg-success" />
                          Online
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="rounded-lg p-1.5 hover:bg-secondary transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Cuisines */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {chef.cuisines.slice(0, 3).map((cuisine) => (
                  <span key={cuisine} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {cuisine}
                  </span>
                ))}
                {chef.cuisines.length > 3 && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    +{chef.cuisines.length - 3}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-warning" />
                  <span className="font-medium text-foreground">{chef.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{chef.totalOrders} orders</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Joined {new Date(chef.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
          {(!chefs || chefs.length === 0) && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No chefs found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OnboardingBadge({ status, verified }: { status?: OnboardingStatus; verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
        <CheckCircle className="h-3 w-3" />
        Verified
      </span>
    );
  }

  switch (status) {
    case 'submitted':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3 w-3" />
          {status || 'Not started'}
        </span>
      );
  }
}
