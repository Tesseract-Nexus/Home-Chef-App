import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  ChefHat,
  Clock,
  Star,
  ArrowRight,
  Utensils,
  Heart,
  Truck,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { apiClient } from '@/shared/services/api-client';
import type { Chef, PaginatedResponse } from '@/shared/types';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: featuredChefs } = useQuery({
    queryKey: ['chefs', 'featured'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Chef>>('/chefs', {
        sort: 'rating',
        limit: 6,
        isOpen: true,
      }),
  });

  const cuisines = [
    { name: 'South Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=200&fit=crop' },
    { name: 'Italian', image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=300&h=200&fit=crop' },
    { name: 'Japanese', image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=300&h=200&fit=crop' },
    { name: 'North Indian', image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=300&h=200&fit=crop' },
    { name: 'Mexican', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&h=200&fit=crop' },
    { name: 'Thai', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300&h=200&fit=crop' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20 lg:py-32">
        <div className="container-app">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Homemade Food,{' '}
              <span className="text-brand-500">Delivered Fresh</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Discover talented home chefs in your neighborhood and enjoy authentic,
              homemade meals delivered right to your doorstep.
            </p>

            {/* Search Bar */}
            <div className="mt-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your delivery address..."
                    className="input-base pl-12 py-4 text-base"
                  />
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for dishes or chefs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-base pl-12 py-4 text-base"
                  />
                </div>
                <Link
                  to={`/chefs${searchQuery ? `?search=${searchQuery}` : ''}`}
                  className="btn-primary py-4 px-8 text-base"
                >
                  Find Food
                </Link>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-brand-500" />
                <span>500+ Home Chefs</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-brand-500" />
                <span>4.8 Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-500" />
                <span>30-45 min Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-white">
        <div className="container-app">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How HomeChef Works</h2>
            <p className="mt-3 text-gray-600">
              Get delicious homemade food in three simple steps
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: 'Discover',
                description: 'Browse home chefs near you and explore their authentic menus',
              },
              {
                icon: Utensils,
                title: 'Order',
                description: 'Select your favorite dishes and place your order securely',
              },
              {
                icon: Truck,
                title: 'Enjoy',
                description: 'Get fresh homemade food delivered to your doorstep',
              },
            ].map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                  <step.icon className="h-8 w-8 text-brand-600" />
                </div>
                <div className="mt-6">
                  <span className="text-sm font-medium text-brand-500">Step {index + 1}</span>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cuisines */}
      <section className="section bg-gray-50">
        <div className="container-app">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Explore Cuisines</h2>
              <p className="mt-2 text-gray-600">Discover authentic flavors from around the world</p>
            </div>
            <Link
              to="/chefs"
              className="hidden items-center gap-2 text-brand-600 hover:text-brand-700 sm:flex"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {cuisines.map((cuisine) => (
              <Link
                key={cuisine.name}
                to={`/chefs?cuisine=${cuisine.name}`}
                className="group relative overflow-hidden rounded-xl"
              >
                <div className="aspect-[4/3]">
                  <img
                    src={cuisine.image}
                    alt={cuisine.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-semibold text-white">{cuisine.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Chefs */}
      <section className="section bg-white">
        <div className="container-app">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Top Rated Chefs</h2>
              <p className="mt-2 text-gray-600">Our community's favorite home chefs</p>
            </div>
            <Link
              to="/chefs"
              className="hidden items-center gap-2 text-brand-600 hover:text-brand-700 sm:flex"
            >
              View All Chefs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(featuredChefs?.data ?? []).map((chef) => (
              <Link
                key={chef.id}
                to={`/chefs/${chef.id}`}
                className="card card-hover overflow-hidden"
              >
                {/* Banner */}
                <div className="relative h-32">
                  <img
                    src={chef.bannerImage || chef.profileImage}
                    alt={chef.businessName}
                    className="h-full w-full object-cover"
                  />
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
                    <div>
                      <h3 className="font-semibold text-gray-900">{chef.businessName}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {chef.cuisines.slice(0, 2).join(' • ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1">
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
            ))}
          </div>
        </div>
      </section>

      {/* Catering CTA */}
      <section className="section bg-brand-500">
        <div className="container-app">
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white">
                Planning an Event?
              </h2>
              <p className="mt-3 text-lg text-brand-100">
                Get catering quotes from multiple home chefs. Perfect for parties,
                corporate events, and special occasions.
              </p>
            </div>
            <Link
              to="/catering"
              className="btn-base bg-white px-8 py-4 text-brand-600 hover:bg-brand-50"
            >
              Request Catering Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-gray-50">
        <div className="container-app">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose HomeChef?</h2>
            <p className="mt-3 text-gray-600">
              Join thousands of happy customers enjoying homemade food
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ChefHat,
                title: 'Verified Chefs',
                description: 'All our home chefs are verified for food safety and quality',
              },
              {
                icon: Heart,
                title: 'Made with Love',
                description: 'Every meal is prepared fresh with authentic family recipes',
              },
              {
                icon: Shield,
                title: 'Secure Payments',
                description: 'Safe and secure payment processing for every order',
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                description: 'Reliable delivery to your doorstep within 30-45 minutes',
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100">
                  <feature.icon className="h-7 w-7 text-brand-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Chef CTA */}
      <section className="section bg-white">
        <div className="container-app">
          <div className="overflow-hidden rounded-2xl bg-gray-900">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-8 md:p-12">
                <h2 className="text-3xl font-bold text-white">
                  Love Cooking? Share Your Talent
                </h2>
                <p className="mt-4 text-gray-300">
                  Turn your passion into income. Join our community of home chefs
                  and start earning by sharing your delicious homemade food.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/become-chef"
                    className="btn-primary"
                  >
                    Become a Chef
                  </Link>
                  <Link
                    to="/chef-resources"
                    className="btn-outline border-gray-600 text-white hover:bg-gray-800"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="hidden md:block md:w-1/3">
                <img
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop"
                  alt="Home chef cooking"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
