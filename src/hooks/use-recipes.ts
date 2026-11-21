import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api, type NewRecipe, type RecipePage } from '@/lib/api';

export const recipeKeys = {
  all: ['recipes'] as const,
  detail: (id: number) => ['recipes', id] as const,
};

type RecipePages = InfiniteData<RecipePage, number | undefined>;

// Loads recipes one page at a time; call fetchNextPage to load more.
// `data` is the loaded pages flattened into a single list.
export const useRecipes = () =>
  useInfiniteQuery({
    queryKey: recipeKeys.all,
    queryFn: ({ pageParam }) => api.getRecipes(pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((page) => page.items),
  });

export const useRecipe = (id: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => api.getRecipe(id),
    // Show the recipe from the already-loaded list right away while the full one loads
    placeholderData: () =>
      queryClient
        .getQueryData<RecipePages>(recipeKeys.all)
        ?.pages.flatMap((page) => page.items)
        .find((recipe) => recipe.id === id),
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
      // Drop it from the loaded pages right away, then refetch the list to be sure.
      // The recipe's own cache entry is cleared automatically once its screen closes.
      queryClient.setQueryData<RecipePages>(
        recipeKeys.all,
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.filter((recipe) => recipe.id !== id),
            })),
          },
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.all, exact: true });
    },
  });
};
