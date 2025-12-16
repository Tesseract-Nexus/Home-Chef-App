import { Link } from 'react-router-dom';
import { Star, Clock, Plus, Heart, Flame } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { FOOD_PLACEHOLDERS } from '@/shared/constants/images';

interface FoodCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  prepTime?: string;
  chefName?: string;
  chefId?: string;
  isVegetarian?: boolean;
  spicyLevel?: 1 | 2 | 3;
  discount?: number;
  onAddToCart?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  className?: string;
}

export function FoodCard({
  id,
  name,
  description,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  prepTime,
  chefName,
  chefId,
  isVegetarian,
  spicyLevel,
  discount,
  onAddToCart,
  onFavorite,
  isFavorite = false,
  className,
}: FoodCardProps) {
  const imageUrl = image || FOOD_PLACEHOLDERS[parseInt(id) % FOOD_PLACEHOLDERS.length];

  return (
    <div className={cn('food-card', className)}>
      {/* Image */}
      <Link to={`/menu/${id}`} className="food-card-image">
        <img src={imageUrl} alt={name} loading="lazy" />
        <div className="food-card-overlay" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discount && (
            <span className="discount-badge">-{discount}%</span>
          )}
          {isVegetarian && (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-fresh-500 text-white">
              <span className="text-xs">V</span>
            </span>
          )}
        </div>

        {/* Favorite button */}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavorite();
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all hover:bg-white hover:scale-110"
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isFavorite ? 'fill-spice-500 text-spice-500' : 'text-gray-600'
              )}
            />
          </button>
        )}
      </Link>

      {/* Content */}
      <div className="food-card-content">
        <Link to={`/menu/${id}`}>
          <h3 className="food-card-title">{name}</h3>
        </Link>

        {description && (
          <p className="food-card-description">{description}</p>
        )}

        {/* Chef link */}
        {chefName && chefId && (
          <Link
            to={`/chefs/${chefId}`}
            className="mt-2 inline-block text-sm text-brand-600 hover:underline"
          >
            by {chefName}
          </Link>
        )}

        {/* Meta info */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-golden-400 text-golden-400" />
              <span className="font-medium text-gray-900">{rating}</span>
              {reviewCount && <span>({reviewCount})</span>}
            </div>
          )}
          {prepTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{prepTime}</span>
            </div>
          )}
          {spicyLevel && (
            <div className="spicy-level">
              {[1, 2, 3].map((level) => (
                <Flame
                  key={level}
                  className={cn(
                    'h-4 w-4',
                    level <= spicyLevel ? 'text-spice-500' : 'text-gray-300'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="food-card-footer">
          <div className="price-tag text-brand-600">
            <span className="price-tag-currency">$</span>
            <span className="price-tag-amount">{price.toFixed(2)}</span>
            {originalPrice && originalPrice > price && (
              <span className="price-tag-original ml-2">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {onAddToCart && (
            <button
              onClick={onAddToCart}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white transition-all hover:bg-brand-600 active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for lists
export function FoodCardCompact({
  id,
  name,
  price,
  image,
  chefName,
  onAddToCart,
}: Pick<FoodCardProps, 'id' | 'name' | 'price' | 'image' | 'chefName' | 'onAddToCart'>) {
  const imageUrl = image || FOOD_PLACEHOLDERS[parseInt(id) % FOOD_PLACEHOLDERS.length];

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3">
      <img
        src={imageUrl}
        alt={name}
        className="h-20 w-20 rounded-lg object-cover"
        loading="lazy"
      />
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{name}</h4>
        {chefName && (
          <p className="text-sm text-gray-500">by {chefName}</p>
        )}
        <p className="mt-1 font-bold text-brand-600">${price.toFixed(2)}</p>
      </div>
      {onAddToCart && (
        <button
          onClick={onAddToCart}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-all hover:bg-brand-200 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
