import { createContext, type PropsWithChildren, use, useState } from 'react';

import { type RecipeFilters } from '@/lib/api';

type RecipeFiltersContextValue = {
  filters: RecipeFilters;
  setFilters: (filters: RecipeFilters) => void;
};

const RecipeFiltersContext = createContext<RecipeFiltersContextValue | null>(null);

// Holds the advanced search filters, shared by the Home list and the Advanced search screen
export const RecipeFiltersProvider = ({ children }: PropsWithChildren) => {
  const [filters, setFilters] = useState<RecipeFilters>({});

  return <RecipeFiltersContext value={{ filters, setFilters }}>{children}</RecipeFiltersContext>;
};

export const useRecipeFilters = () => {
  const context = use(RecipeFiltersContext);

  if (!context) throw new Error('useRecipeFilters must be used inside RecipeFiltersProvider');

  return context;
};
