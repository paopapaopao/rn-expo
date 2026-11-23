import Constants from 'expo-constants';

const BACKEND_PORT = 4000;

// EXPO_PUBLIC_API_URL wins when set (required for production builds).
// In development, fall back to the machine running the Expo dev server, so the
// same code reaches the backend from a simulator, emulator, or physical device.
const resolveBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';

  return `http://${host}:${BACKEND_PORT}`;
};

export const API_URL = resolveBaseUrl();

// Same values as the `difficulty` and `mealType` enums in express-drizzle/src/db/schema.ts
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'beverage',
  'snack',
  'side dish',
  'appetizer',
  'dessert',
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];
export type MealType = (typeof MEAL_TYPES)[number];

// The API requires an image, so recipes created without one store this value instead.
// Temporary until the API's `image` column becomes optional.
export const NO_IMAGE = 'none';

// Mirrors `recipesTable` in express-drizzle/src/db/schema.ts (dates arrive as ISO strings)
export type Recipe = {
  id: number;
  name: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number | null;
  cookTime: number | null;
  difficulty: Difficulty | null;
  servings: number | null;
  calories: number | null;
  cuisine: string | null;
  mealTypes: MealType[] | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type NewRecipe = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;

// One page of GET /recipes. Pass `nextCursor` as `cursor` to get the next page; null on the last one.
export type RecipePage = {
  items: Recipe[];
  nextCursor: number | null;
};

export const RECIPES_PAGE_SIZE = 10;

// Advanced search filters, matching GET /recipes' query parameters in express-drizzle.
// Text matches anywhere, case-insensitive. Lists of terms must all match; lists of options match any.
export type RecipeFilters = {
  cuisine?: string;
  ingredients?: string[];
  instructions?: string[];
  tags?: string[];
  difficulty?: Difficulty[];
  mealTypes?: MealType[];
  prepTimeMin?: number;
  prepTimeMax?: number;
  cookTimeMin?: number;
  cookTimeMax?: number;
  servingsMin?: number;
  servingsMax?: number;
  caloriesMin?: number;
  caloriesMax?: number;
};

// Everything a recipe list can be narrowed by: the search bar's name plus the advanced filters
export type RecipeSearch = RecipeFilters & { name?: string };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.message ?? res.statusText, body?.errors);
  }

  return (res.status === 204 ? undefined : await res.json()) as T;
};

export const api = {
  getRecipes: (search: RecipeSearch, cursor?: number) => {
    const params = new URLSearchParams({ limit: String(RECIPES_PAGE_SIZE) });

    for (const [key, value] of Object.entries(search)) {
      if (value === undefined || value === '') continue;
      // Lists are sent comma-separated, e.g. ingredients=tomato,basil
      params.set(key, Array.isArray(value) ? value.join(',') : String(value));
    }
    if (cursor !== undefined) params.set('cursor', String(cursor));

    return request<RecipePage>(`/recipes?${params}`);
  },
  getRecipe: (id: number) => request<Recipe>(`/recipes/${id}`),
  createRecipe: (recipe: NewRecipe) =>
    request<Recipe>('/recipes', { method: 'POST', body: JSON.stringify(recipe) }),
  updateRecipe: (id: number, changes: Partial<NewRecipe>) =>
    request<Recipe>(`/recipes/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
  deleteRecipe: (id: number) => request<void>(`/recipes/${id}`, { method: 'DELETE' }),
};
