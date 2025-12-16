import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Filter,
  ChevronDown,
  X,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/shared/services/api-client';
import type { Chef, PaginatedResponse, ChefFilters } from '@/shared/types';

const CUISINES = [
  'South Indian',
  'North Indian',
  'Italian',
  'Japanese',
  'Mexican',
  'Thai',
  'Chinese',
  'Mediterranean',
  'American',
  'Continental',
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Halal',
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'distance', label: 'Nearest' },
  { value: 'orders', label: 'Most Popular' },
  { value: 'price', label: 'Price' },
];

export default function BrowseChefsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const filters: ChefFilters = {
    search: searchParams.get('search') || undefined,
    cuisine: searchParams.get('cuisine') || undefined,
    dietary: searchParams.get('dietary') || undefined,
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    isOpen: searchParams.get('isOpen') === 'true' ? true : undefined,
    sort: (searchParams.get('sort') as ChefFilters['sort']) || 'rating',
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['chefs', filters],
    queryFn: () => apiClient.get<PaginatedResponse<Chef>>('/chefs', filters),
  });

  const updateFilters = (newFilters: Partial<ChefFilters>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    // Reset to page 1 when filters change
    if (!newFilters.page) {
      params.set('page', '1');
    }
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchQuery('');
  };

  const activeFilterCount = [
    filters.cuisine,
    filters.dietary,
    filters.rating,
    filters.isOpen,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Home Chefs</h1>
          <p className="mt-2 text-gray-600">
            Discover talented home chefs serving authentic homemade food
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chefs, dishes, cuisines..."
                className="input-base pl-12 pr-4 py-3"
              />
            </div>
          </form>

          {/* Sort and Filter buttons */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={filters.sort || 'rating'}
                onChange={(e) => updateFilters({ sort: e.target.value as ChefFilters['sort'] })}
                className="input-base appearance-none pr-10 py-2.5"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline flex items-center gap-2 py-2.5 ${
                activeFilterCount > 0 ? 'border-brand-500 text-brand-600' : ''
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-brand-600 hover:text-brand-700"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Cuisine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine
                </label>
                <select
                  value={filters.cuisine || ''}
                  onChange={(e) => updateFilters({ cuisine: e.target.value })}
                  className="input-base"
                >
                  <option value="">All Cuisines</option>
                  {CUISINES.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dietary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary
                </label>
                <select
                  value={filters.dietary || ''}
                  onChange={(e) => updateFilters({ dietary: e.target.value })}
                  className="input-base"
                >
                  <option value="">All Options</option>
                  {DIETARY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating || ''}
                  onChange={(e) =>
                    updateFilters({ rating: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="input-base"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>

              {/* Open Now */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isOpen || false}
                    onChange={(e) =>
                      updateFilters({ isOpen: e.target.checked ? true : undefined })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-gray-700">Open Now</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Active filters */}
        {(filters.search || filters.cuisine || filters.dietary) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-700">
                Search: {filters.search}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    updateFilters({ search: undefined });
                  }}
                  className="hover:text-brand-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.cuisine && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-700">
                {filters.cuisine}
                <button
                  onClick={() => updateFilters({ cuisine: undefined })}
                  className="hover:text-brand-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.dietary && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-700">
                {filters.dietary}
                <button
                  onClick={() => updateFilters({ dietary: undefined })}
                  className="hover:text-brand-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-8 text-center">
            <p className="text-red-600">Failed to load chefs. Please try again.</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="rounded-xl bg-gray-100 p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No chefs found</h3>
            <p className="mt-2 text-gray-600">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearAllFilters}
              className="btn-primary mt-4"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="mb-4 text-sm text-gray-500">
              Showing {data?.data.length} of {data?.pagination.total} chefs
            </p>

            {/* Chef Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data?.data.map((chef) => (
                <ChefCard key={chef.id} chef={chef} />
              ))}
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateFilters({ page: filters.page! - 1 })}
                  disabled={!data.pagination.hasPrev}
                  className="btn-outline disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 text-sm text-gray-600">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => updateFilters({ page: filters.page! + 1 })}
                  disabled={!data.pagination.hasNext}
                  className="btn-outline disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ChefCard({ chef }: { chef: Chef }) {
  return (
    <Link
      to={`/chefs/${chef.id}`}
      className="card card-hover overflow-hidden group"
    >
      {/* Banner */}
      <div className="relative h-32">
        <img
          src={chef.bannerImage || chef.profileImage}
          alt={chef.businessName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {chef.verified && (
          <div className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
            Verified
          </div>
        )}
        <div className="absolute -bottom-8 left-4">
          <img
            src={chef.profileImage}
            alt={chef.businessName}
            className="h-16 w-16 rounded-xl border-4 border-white object-cover shadow-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-10">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{chef.businessName}</h3>
            <p className="mt-1 text-sm text-gray-500 truncate">
              {chef.cuisines.slice(0, 2).join(' • ')}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 ml-2 flex-shrink-0">
            <Star className="h-4 w-4 fill-green-500 text-green-500" />
            <span className="text-sm font-medium text-green-700">{chef.rating}</span>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-gray-600">{chef.description}</p>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {chef.prepTime}
          </div>
          <div>{chef.priceRange}</div>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="h-4 w-4" />
            {chef.serviceRadius} km radius
          </div>
          {chef.acceptingOrders ? (
            <span className="flex items-center gap-1 text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Open
            </span>
          ) : (
            <span className="text-gray-400">Closed</span>
          )}
        </div>
      </div>
    </Link>
  );
}
