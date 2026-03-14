import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Eye,
  Loader2,
  ChefHat,
  FileText,
  UtensilsCrossed,
  IndianRupee,
} from 'lucide-react';
import { apiClient } from '@/shared/services/api-client';

interface ApprovalRequest {
  id: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  chefId: string;
  entityType: string;
  entityId: string;
  adminNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  chef?: { businessName: string; user?: { firstName: string; lastName: string; email: string } };
  submittedBy?: { firstName: string; lastName: string; email: string };
}

interface ApprovalsResponse {
  data: ApprovalRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const typeConfig: Record<string, { icon: typeof ChefHat; label: string; style: string }> = {
  kitchen_onboarding: { icon: ChefHat, label: 'Kitchen Onboarding', style: 'bg-primary/10 text-primary' },
  document_verification: { icon: FileText, label: 'Document Verification', style: 'bg-info/10 text-info' },
  menu_item_new: { icon: UtensilsCrossed, label: 'New Menu Item', style: 'bg-success/10 text-success' },
  pricing_change: { icon: IndianRupee, label: 'Pricing Change', style: 'bg-warning/10 text-warning' },
};

const priorityStyles: Record<string, string> = {
  urgent: 'bg-destructive/10 text-destructive',
  high: 'bg-warning/10 text-warning',
  normal: 'bg-muted text-muted-foreground',
  low: 'bg-secondary text-muted-foreground',
};

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  info_requested: 'bg-info/10 text-info',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  info_requested: 'Info Requested',
};

export default function ApprovalsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-approvals', search, statusFilter, typeFilter, page],
    queryFn: () =>
      apiClient.get<ApprovalsResponse>('/admin/approvals', {
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        page,
        limit: 20,
      }),
  });

  const resp = data as unknown as ApprovalsResponse | undefined;
  const approvals = resp?.data ?? [];
  const pagination = resp?.pagination;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Approval Reviews</h1>
        <p className="page-description">
          Review and manage approval requests from chefs and kitchens
          {pagination && <span className="ml-1 font-medium">({pagination.total} total)</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, chef, or kitchen..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="info_requested">Info Requested</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Types</option>
            <option value="kitchen_onboarding">Kitchen Onboarding</option>
            <option value="document_verification">Document Verification</option>
            <option value="menu_item_new">New Menu Item</option>
            <option value="pricing_change">Pricing Change</option>
          </select>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="rounded-xl border border-border bg-card shadow-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Chef / Kitchen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Submitted</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {approvals.map((approval) => {
                  const typeInfo = typeConfig[approval.type];
                  const TypeIcon = typeInfo?.icon || FileText;
                  return (
                    <tr key={approval.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${typeInfo?.style || 'bg-muted text-muted-foreground'}`}>
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{typeInfo?.label || approval.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">{approval.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{approval.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">{approval.chef?.businessName || '--'}</p>
                        {approval.chef?.user && (
                          <p className="text-xs text-muted-foreground">
                            {approval.chef.user.firstName} {approval.chef.user.lastName}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${priorityStyles[approval.priority] || priorityStyles.normal}`}>
                          {approval.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[approval.status] || 'bg-muted text-muted-foreground'}`}>
                          {statusLabels[approval.status] || approval.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(approval.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/approvals/${approval.id}`)} title="View Details"
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {approvals.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-20 text-center text-muted-foreground">No approval requests found</td></tr>
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
    </div>
  );
}
