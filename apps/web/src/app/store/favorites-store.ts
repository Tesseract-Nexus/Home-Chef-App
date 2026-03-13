import { create } from 'zustand';
import { apiClient } from '@/shared/services/api-client';

interface FavoritesState {
  /** Set of favorited chef IDs for O(1) lookup */
  chefIds: Set<string>;
  isLoaded: boolean;
  /** Fetch the user's favorite chef IDs from the API */
  load: () => Promise<void>;
  /** Toggle a chef's favorite status. Returns false if at max (7). */
  toggle: (chefId: string) => Promise<boolean>;
  isFavorite: (chefId: string) => boolean;
  clear: () => void;
}

const MAX_FAVORITES = 7;

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  chefIds: new Set(),
  isLoaded: false,

  load: async () => {
    try {
      const res = await apiClient.get<{ chefIds: string[] }>('/favorites/chefs/ids');
      set({ chefIds: new Set(res.chefIds), isLoaded: true });
    } catch {
      // Not authenticated or network error — silently ignore
      set({ isLoaded: true });
    }
  },

  toggle: async (chefId: string) => {
    const { chefIds } = get();
    const wasFavorite = chefIds.has(chefId);

    if (wasFavorite) {
      // Optimistic remove
      const next = new Set(chefIds);
      next.delete(chefId);
      set({ chefIds: next });

      try {
        await apiClient.delete(`/favorites/chefs/${chefId}`);
      } catch {
        // Rollback
        const rollback = new Set(get().chefIds);
        rollback.add(chefId);
        set({ chefIds: rollback });
        return false;
      }
      return true;
    } else {
      // Check limit client-side
      if (chefIds.size >= MAX_FAVORITES) {
        return false;
      }

      // Optimistic add
      const next = new Set(chefIds);
      next.add(chefId);
      set({ chefIds: next });

      try {
        await apiClient.post('/favorites/chefs', { chefId });
      } catch {
        // Rollback
        const rollback = new Set(get().chefIds);
        rollback.delete(chefId);
        set({ chefIds: rollback });
        return false;
      }
      return true;
    }
  },

  isFavorite: (chefId: string) => get().chefIds.has(chefId),

  clear: () => set({ chefIds: new Set(), isLoaded: false }),
}));
