import {
  type InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api, type NewRecipe, type RecipePage, type RecipeSearch } from '@/lib/api';

export const recipeKeys = {
  // Every recipe list, one per search
  lists: ['recipes', 'list'] as const,
  list: (search: RecipeSearch) => ['recipes', 'list', search] as const,
  detail: (id: number) => ['recipes', 'detail', id] as const,
};

type RecipePages = InfiniteData<RecipePage, number | undefined>;

// Loads recipes matching `search` (all of them when empty) one page at a time;
// call fetchNextPage to load more. `data` is the loaded pages flattened into a single list.
export const useRecipes = (search: RecipeSearch) =>
  useInfiniteQuery({
    queryKey: recipeKeys.list(search),
    queryFn: ({ pageParam }) => api.getRecipes(search, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((page) => page.items),
    // While a new search loads, keep showing the previous results instead of skeletons
    placeholderData: keepPreviousData,
  });

export const useRecipe = (id: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => api.getRecipe(id),
    // Show the recipe from an already-loaded list right away while the full one loads
    placeholderData: () =>
      queryClient
        .getQueriesData<RecipePages>({ queryKey: recipeKeys.lists })
        .flatMap(([, data]) => data?.pages.flatMap((page) => page.items) ?? [])
        .find((recipe) => recipe.id === id),
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipe: NewRecipe) => api.createRecipe(recipe),
    onSuccess: (recipe) => {
      // Cache the new recipe so its screen opens instantly, and refetch the lists to include it
      queryClient.setQueryData(recipeKeys.detail(recipe.id), recipe);
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists });
    },
  });
};

export const useUpdateRecipe = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (changes: Partial<NewRecipe>) => api.updateRecipe(id, changes),
    onSuccess: (recipe) => {
      // Show the saved version on the recipe screen right away, and refetch the lists
      queryClient.setQueryData(recipeKeys.detail(id), recipe);
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists });
    },
  });
};

export const useDeleteRecipe = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.deleteRecipe(id),
    onSuccess: () => {
      // Drop it from every loaded list right away, then refetch the lists to be sure.
      // The recipe's own cache entry is cleared automatically once its screen closes.
      queryClient.setQueriesData<RecipePages>(
        { queryKey: recipeKeys.lists },
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.filter((recipe) => recipe.id !== id),
            })),
          },
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists });
    },
  });
};
