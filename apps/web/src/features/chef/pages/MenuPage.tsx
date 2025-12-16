import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Loader2,
  Upload,
  X,
  ChefHat,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/services/api-client';
import type { MenuItem, MenuCategory } from '@/shared/types';

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  comparePrice: z.number().optional(),
  categoryId: z.string().optional(),
  prepTime: z.number().min(1, 'Prep time is required'),
  portionSize: z.string().optional(),
  serves: z.number().min(1).default(1),
  dietaryTags: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

const DIETARY_TAGS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb'];
const ALLERGENS = ['Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Shellfish', 'Fish'];

export default function ChefMenuPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const queryClient = useQueryClient();

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['chef-menu'],
    queryFn: () =>
      apiClient.get<{ categories: MenuCategory[]; items: MenuItem[] }>('/chef/menu'),
  });

  const createMutation = useMutation({
    mutationFn: (data: MenuItemFormData) => apiClient.post<MenuItem>('/chef/menu/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chef-menu'] });
      toast.success('Menu item created successfully');
      setShowForm(false);
    },
    onError: () => {
      toast.error('Failed to create menu item');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItemFormData> }) =>
      apiClient.put<MenuItem>(`/chef/menu/items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chef-menu'] });
      toast.success('Menu item updated successfully');
      setShowForm(false);
      setEditingItem(null);
    },
    onError: () => {
      toast.error('Failed to update menu item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/chef/menu/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chef-menu'] });
      toast.success('Menu item deleted');
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      apiClient.put(`/chef/menu/items/${id}`, { isAvailable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chef-menu'] });
    },
  });

  const categories = menuData?.categories || [];
  const allItems = menuData?.items || [];

  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item: MenuItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="mt-1 text-gray-600">
            {allItems.length} item{allItems.length !== 1 ? 's' : ''} in your menu
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-5 w-5" />
          Add Item
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="input-base pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-brand-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <ChefHat className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 font-medium text-gray-900">No menu items</h3>
          <p className="mt-2 text-gray-600">
            {searchQuery
              ? 'No items match your search'
              : 'Add your first menu item to get started'}
          </p>
          {!searchQuery && (
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              Add Menu Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
              onToggleAvailability={() =>
                toggleAvailability.mutate({ id: item.id, isAvailable: !item.isAvailable })
              }
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <MenuItemForm
          item={editingItem}
          categories={categories}
          onSubmit={(data) => {
            if (editingItem) {
              updateMutation.mutate({ id: editingItem.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}) {
  return (
    <div className={`rounded-xl bg-white shadow-sm overflow-hidden ${!item.isAvailable ? 'opacity-60' : ''}`}>
      {/* Image */}
      <div className="relative aspect-video">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-gray-300" />
          </div>
        )}
        {item.isFeatured && (
          <span className="absolute top-2 left-2 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
            <Star className="mr-1 inline h-3 w-3" />
            Featured
          </span>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-medium">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
          </div>
        </div>

        {/* Tags */}
        {item.dietaryTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.dietaryTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price & Prep Time */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
            {item.comparePrice && (
              <span className="text-sm text-gray-400 line-through">
                ${item.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">{item.prepTime} min</span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t pt-4">
          <button
            onClick={onToggleAvailability}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              item.isAvailable
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {item.isAvailable ? (
              <>
                <EyeOff className="mr-1 inline h-4 w-4" />
                Hide
              </>
            ) : (
              <>
                <Eye className="mr-1 inline h-4 w-4" />
                Show
              </>
            )}
          </button>
          <button
            onClick={onEdit}
            className="rounded-lg bg-brand-100 p-2 text-brand-600 hover:bg-brand-200"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuItemForm({
  item,
  categories,
  onSubmit,
  onClose,
  isLoading,
}: {
  item: MenuItem | null;
  categories: MenuCategory[];
  onSubmit: (data: MenuItemFormData) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: item
      ? {
          name: item.name,
          description: item.description || '',
          price: item.price,
          comparePrice: item.comparePrice,
          categoryId: item.categoryId,
          prepTime: item.prepTime,
          portionSize: item.portionSize,
          serves: item.serves,
          dietaryTags: item.dietaryTags,
          allergens: item.allergens,
          isAvailable: item.isAvailable,
          isFeatured: item.isFeatured,
        }
      : {
          serves: 1,
          isAvailable: true,
          isFeatured: false,
          dietaryTags: [],
          allergens: [],
        },
  });

  const dietaryTags = watch('dietaryTags') || [];
  const allergens = watch('allergens') || [];

  const toggleTag = (tag: string, field: 'dietaryTags' | 'allergens') => {
    const current = field === 'dietaryTags' ? dietaryTags : allergens;
    if (current.includes(tag)) {
      setValue(field, current.filter((t) => t !== tag));
    } else {
      setValue(field, [...current, tag]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-20">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input {...register('name')} className="input-base mt-1" />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea {...register('description')} rows={3} className="input-base mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price *</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className="input-base pl-7"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Compare Price (optional)
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  {...register('comparePrice', { valueAsNumber: true })}
                  className="input-base pl-7"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select {...register('categoryId')} className="input-base mt-1">
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Prep Time (min) *</label>
              <input
                type="number"
                {...register('prepTime', { valueAsNumber: true })}
                className="input-base mt-1"
              />
              {errors.prepTime && (
                <p className="mt-1 text-xs text-red-600">{errors.prepTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Portion Size</label>
              <input {...register('portionSize')} className="input-base mt-1" placeholder="e.g., 500g" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Serves</label>
              <input
                type="number"
                {...register('serves', { valueAsNumber: true })}
                className="input-base mt-1"
              />
            </div>
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag, 'dietaryTags')}
                  className={`rounded-full px-3 py-1 text-sm ${
                    dietaryTags.includes(tag)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Allergens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contains Allergens</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((allergen) => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => toggleTag(allergen, 'allergens')}
                  className={`rounded-full px-3 py-1 text-sm ${
                    allergens.includes(allergen)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isAvailable')}
                className="h-4 w-4 rounded border-gray-300 text-brand-600"
              />
              <span className="text-sm text-gray-700">Available for order</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="h-4 w-4 rounded border-gray-300 text-brand-600"
              />
              <span className="text-sm text-gray-700">Featured item</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : item ? (
                'Save Changes'
              ) : (
                'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
