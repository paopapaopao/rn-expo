import { useQuery, useQueryClient } from '@tanstack/react-query';

import { api, type Recipe } from '@/lib/api';

export const recipeKeys = {
  all: ['recipes'] as const,
  detail: (id: number) => ['recipes', id] as const,
};

export const useRecipes = () =>
  useQuery({
    queryKey: recipeKeys.all,
    queryFn: api.getRecipes,
  });

export const useRecipe = (id: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => api.getRecipe(id),
    // Show the recipe from the already-loaded list right away while the full one loads
    placeholderData: () =>
      queryClient.getQueryData<Recipe[]>(recipeKeys.all)?.find((recipe) => recipe.id === id),
  });
};
