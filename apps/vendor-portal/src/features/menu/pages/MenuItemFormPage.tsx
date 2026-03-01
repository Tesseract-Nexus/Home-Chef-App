import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  ImageIcon,
  Clock,
  DollarSign,
  Users,
  UtensilsCrossed,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/services/api-client';
import { staggerContainer, fadeInUp } from '@/shared/utils/animations';
import { Button } from '@/shared/components/ui/Button';
import { Input, Textarea } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/shared/components/ui/Select';
import type { MenuItem, MenuCategory } from '@/shared/types';

// --- Zod validation schema ---

const menuItemSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .optional()
    .or(z.literal('')),
  price: z
    .number({ invalid_type_error: 'Price is required' })
    .min(0.01, 'Price must be greater than 0')
    .max(9999.99, 'Price must be under $10,000'),
  categoryId: z.string().optional().or(z.literal('')),
  dietaryTags: z.array(z.string()).default([]),
  allergens: z.string().optional().or(z.literal('')),
  prepTime: z
    .number({ invalid_type_error: 'Prep time is required' })
    .min(1, 'Prep time must be at least 1 minute')
    .max(480, 'Prep time must be under 8 hours'),
  portionSize: z.string().optional().or(z.literal('')),
  serves: z
    .number({ invalid_type_error: 'Serves count is required' })
    .min(1, 'Must serve at least 1')
    .max(100, 'Must serve under 100'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

const DIETARY_TAG_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'halal', label: 'Halal' },
  { value: 'nut-free', label: 'Nut-Free' },
];

export default function MenuItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isEditMode = Boolean(id);

  // Fetch existing item for edit mode
  const {
    data: existingItem,
    isLoading: isLoadingItem,
  } = useQuery<MenuItem>({
    queryKey: ['chef-menu-item', id],
    queryFn: () => apiClient.get<MenuItem>(`/chef/menu/items/${id}`),
    enabled: isEditMode,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<MenuCategory[]>({
    queryKey: ['chef-menu-categories'],
    queryFn: () => apiClient.get<MenuCategory[]>('/chef/menu/categories'),
  });

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      price: undefined as unknown as number,
      categoryId: '',
      dietaryTags: [],
      allergens: '',
      prepTime: undefined as unknown as number,
      portionSize: '',
      serves: 1,
      imageUrl: '',
    },
  });

  // Populate form when existing item loads
  useEffect(() => {
    if (existingItem) {
      reset({
        name: existingItem.name,
        description: existingItem.description || '',
        price: existingItem.price,
        categoryId: existingItem.categoryId || '',
        dietaryTags: existingItem.dietaryTags || [],
        allergens: existingItem.allergens?.join(', ') || '',
        prepTime: existingItem.prepTime,
        portionSize: existingItem.portionSize || '',
        serves: existingItem.serves,
        imageUrl: existingItem.imageUrl || '',
      });
    }
  }, [existingItem, reset]);

  // Create mutation
  const createItem = useMutation({
    mutationFn: (data: MenuItemFormValues) => {
      const payload = {
        ...data,
        allergens: data.allergens
          ? data.allergens.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
      };
      return apiClient.post<MenuItem>('/chef/menu/items', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chef-menu'] });
      toast.success('Menu item created successfully');
      navigate('/menu');
    },
    onError: () => {
      toast.error('Failed to create menu item');
    },
  });

  // Update mutation
  const updateItem = useMutation({
    mutationFn: (data: MenuItemFormValues) => {
      const payload = {
        ...data,
        allergens: data.allergens
          ? data.allergens.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
      };
      return apiClient.put<MenuItem>(`/chef/menu/items/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chef-menu'] });
      queryClient.invalidateQueries({ queryKey: ['chef-menu-item', id] });
      toast.success('Menu item updated successfully');
      navigate('/menu');
    },
    onError: () => {
      toast.error('Failed to update menu item');
    },
  });

  const onSubmit = (data: MenuItemFormValues) => {
    if (isEditMode) {
      updateItem.mutate(data);
    } else {
      createItem.mutate(data);
    }
  };

  const isSubmitting = createItem.isPending || updateItem.isPending;

  const watchedImageUrl = watch('imageUrl');
  const watchedDietaryTags = watch('dietaryTags');

  // Loading state for edit mode
  if (isEditMode && isLoadingItem) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* Page header */}
      <motion.div variants={fadeInUp} className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/menu" aria-label="Back to menu">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditMode ? 'Edit Menu Item' : 'Add Menu Item'}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isEditMode
              ? 'Update the details of your dish'
              : 'Add a new dish to your menu'}
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <motion.div variants={fadeInUp}>
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Basic Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Item Name"
                placeholder="e.g. Paneer Butter Masala"
                error={errors.name?.message}
                {...register('name')}
              />

              <Textarea
                label="Description"
                placeholder="Describe your dish - ingredients, taste, what makes it special..."
                rows={3}
                error={errors.description?.message}
                {...register('description')}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  error={errors.price?.message}
                  leftIcon={<DollarSign className="h-4 w-4" />}
                  {...register('price', { valueAsNumber: true })}
                />

                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <div className="w-full">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Category
                      </label>
                      <Select
                        value={field.value || ''}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.categoryId?.message && (
                        <p className="mt-1.5 text-sm text-destructive">
                          {errors.categoryId.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Dietary tags and allergens */}
        <motion.div variants={fadeInUp}>
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Dietary Information
            </h2>
            <div className="space-y-4">
              {/* Dietary tags checkboxes */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Dietary Tags
                </label>
                <Controller
                  name="dietaryTags"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_TAG_OPTIONS.map((option) => {
                        const isChecked = field.value.includes(option.value);
                        return (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                              isChecked
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  field.onChange(
                                    field.value.filter(
                                      (v) => v !== option.value
                                    )
                                  );
                                } else {
                                  field.onChange([
                                    ...field.value,
                                    option.value,
                                  ]);
                                }
                              }}
                            />
                            <div
                              className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${
                                isChecked
                                  ? 'border-primary bg-primary'
                                  : 'border-muted-foreground/30'
                              }`}
                            >
                              {isChecked && (
                                <svg
                                  className="h-2.5 w-2.5 text-primary-foreground"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
                {watchedDietaryTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {watchedDietaryTags.map((tag) => (
                      <Badge key={tag} variant="brand" size="sm">
                        {DIETARY_TAG_OPTIONS.find((o) => o.value === tag)
                          ?.label || tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Input
                label="Allergens"
                placeholder="e.g. dairy, nuts, gluten (comma-separated)"
                hint="List allergens separated by commas"
                error={errors.allergens?.message}
                {...register('allergens')}
              />
            </div>
          </Card>
        </motion.div>

        {/* Preparation details */}
        <motion.div variants={fadeInUp}>
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Preparation Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Prep Time (minutes)"
                type="number"
                min="1"
                placeholder="30"
                error={errors.prepTime?.message}
                leftIcon={<Clock className="h-4 w-4" />}
                {...register('prepTime', { valueAsNumber: true })}
              />

              <Input
                label="Portion Size"
                placeholder="e.g. 250g, 1 plate"
                error={errors.portionSize?.message}
                leftIcon={<UtensilsCrossed className="h-4 w-4" />}
                {...register('portionSize')}
              />

              <Input
                label="Serves"
                type="number"
                min="1"
                placeholder="1"
                error={errors.serves?.message}
                leftIcon={<Users className="h-4 w-4" />}
                {...register('serves', { valueAsNumber: true })}
              />
            </div>
          </Card>
        </motion.div>

        {/* Image */}
        <motion.div variants={fadeInUp}>
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Image
            </h2>
            <div className="space-y-4">
              <Input
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                error={errors.imageUrl?.message}
                leftIcon={<ImageIcon className="h-4 w-4" />}
                {...register('imageUrl')}
              />

              {/* Image preview */}
              {watchedImageUrl && !errors.imageUrl && (
                <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-border bg-muted">
                  <img
                    src={watchedImageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {!watchedImageUrl && (
                <div className="flex aspect-video w-full max-w-sm items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Add an image URL above to preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-between border-t border-border pt-6"
        >
          <Button variant="outline" asChild>
            <Link to="/menu">Cancel</Link>
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || (isEditMode && !isDirty)}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {isEditMode ? 'Save Changes' : 'Create Item'}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
