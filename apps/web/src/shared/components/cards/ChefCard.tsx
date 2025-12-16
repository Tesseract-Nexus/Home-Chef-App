import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Heart, Award } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { CHEF_PLACEHOLDERS, FOOD_PLACEHOLDERS } from '@/shared/constants/images';

interface ChefCardProps {
  id: string;
  name: string;
  avatar?: string;
  coverImage?: string;
  specialty?: string;
  cuisines?: string[];
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  distance?: string;
  isVerified?: boolean;
  isFavorite?: boolean;
  onFavorite?: () => void;
  className?: string;
}

export function ChefCard({
  id,
  name,
  avatar,
  coverImage,
  specialty,
  cuisines,
  rating,
  reviewCount,
  deliveryTime,
  distance,
  isVerified,
  isFavorite = false,
  onFavorite,
  className,
}: ChefCardProps) {
  const avatarUrl = avatar || CHEF_PLACEHOLDERS[parseInt(id) % CHEF_PLACEHOLDERS.length];
  const coverUrl = coverImage || FOOD_PLACEHOLDERS[parseInt(id) % FOOD_PLACEHOLDERS.length];

  return (
    <div className={cn('chef-card', className)}>
      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={coverUrl}
          alt={`${name}'s kitchen`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

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

        {/* Verified badge */}
        {isVerified && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-fresh-500 px-2 py-1 text-xs font-medium text-white">
            <Award className="h-3 w-3" />
            Verified
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="chef-card-avatar">
        <img src={avatarUrl} alt={name} loading="lazy" />
      </div>

      {/* Info */}
      <div className="chef-card-info">
        <Link to={`/chefs/${id}`}>
          <h3 className="chef-card-name hover:text-brand-600 transition-colors">
            {name}
          </h3>
        </Link>

        {specialty && (
          <p className="chef-card-specialty">{specialty}</p>
        )}

        {/* Cuisines */}
        {cuisines && cuisines.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {cuisines.slice(0, 3).map((cuisine, index) => (
              <span key={index} className="cuisine-tag">
                {cuisine}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        {rating && (
          <div className="chef-card-rating">
            <Star className="h-4 w-4 fill-golden-400 text-golden-400" />
            <span className="font-medium text-gray-900">{rating}</span>
            {reviewCount && (
              <span className="text-sm text-gray-500">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 flex items-center justify-center gap-4 text-sm text-gray-500">
          {deliveryTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{deliveryTime}</span>
            </div>
          )}
          {distance && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{distance}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/chefs/${id}`}
          className="mt-4 block w-full btn-primary-sm text-center"
        >
          View Menu
        </Link>
      </div>
    </div>
  );
}

// Compact horizontal version
export function ChefCardHorizontal({
  id,
  name,
  avatar,
  specialty,
  rating,
  deliveryTime,
  isVerified,
}: Pick<
  ChefCardProps,
  'id' | 'name' | 'avatar' | 'specialty' | 'rating' | 'deliveryTime' | 'isVerified'
>) {
  const avatarUrl = avatar || CHEF_PLACEHOLDERS[parseInt(id) % CHEF_PLACEHOLDERS.length];

  return (
    <Link
      to={`/chefs/${id}`}
      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
    >
      <div className="relative">
        <img
          src={avatarUrl}
          alt={name}
          className="h-16 w-16 rounded-full object-cover"
          loading="lazy"
        />
        {isVerified && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-fresh-500 text-white">
            <Award className="h-3 w-3" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{name}</h4>
        {specialty && (
          <p className="text-sm text-brand-600">{specialty}</p>
        )}
        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-golden-400 text-golden-400" />
              <span>{rating}</span>
            </div>
          )}
          {deliveryTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{deliveryTime}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
