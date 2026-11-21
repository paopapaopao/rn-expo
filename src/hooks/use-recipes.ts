import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, type NewRecipe, type Recipe } from '@/lib/api';

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

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipe: NewRecipe) => api.createRecipe(recipe),
    onSuccess: (recipe) => {
      // Cache the new recipe so its screen opens instantly, and refetch the list to include it
      queryClient.setQueryData(recipeKeys.detail(recipe.id), recipe);
      queryClient.invalidateQueries({ queryKey: recipeKeys.all, exact: true });
    },
  });
};

export const useUpdateRecipe = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (changes: Partial<NewRecipe>) => api.updateRecipe(id, changes),
    onSuccess: (recipe) => {
      // Show the saved version on the recipe screen right away, and refetch the list
      queryClient.setQueryData(recipeKeys.detail(id), recipe);
      queryClient.invalidateQueries({ queryKey: recipeKeys.all, exact: true });
    },
  });
};

export const useDeleteRecipe = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.deleteRecipe(id),
    onSuccess: () => {
      // Drop it from the list right away, then refetch the list to be sure.
      // The recipe's own cache entry is cleared automatically once its screen closes.
      queryClient.setQueryData<Recipe[]>(recipeKeys.all, (recipes) =>
        recipes?.filter((recipe) => recipe.id !== id),
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.all, exact: true });
    },
  });
};
