import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

export const recipeKeys = {
  all: ['recipes'] as const,
  detail: (id: number) => ['recipes', id] as const,
};

export const useRecipes = () =>
  useQuery({
    queryKey: recipeKeys.all,
    queryFn: api.getRecipes,
  });
