import { z } from 'zod';

import { DIFFICULTIES, MEAL_TYPES, type RecipeFilters } from '@/lib/api';

// Rules mirror the API's validation in express-drizzle/src/routers/recipe-search.ts.
// Inputs are the advanced search form's raw values; outputs are `RecipeFilters`,
// with empty fields left out.

const optionalText = z
  .string()
  .trim()
  .max(100, 'Keep it under 100 characters')
  .transform((text) => text || undefined);

// Comma-separated terms; empty becomes undefined
const terms = z.string().transform((text) => {
  const list = text
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean);

  return list.length > 0 ? list : undefined;
});

const optionalCount = z
  .string()
  .trim()
  .refine((text) => text === '' || /^\d+$/.test(text), { message: 'Enter a whole number' })
  .transform((text) => (text === '' ? undefined : Number(text)));

const options = <T extends string>(values: readonly [T, ...T[]]) =>
  z.array(z.enum(values)).transform((list) => (list.length > 0 ? list : undefined));

// Numeric fields with a Min and Max input each
export const RANGE_FIELDS = ['prepTime', 'cookTime', 'servings', 'calories'] as const;

export const recipeFiltersSchema = z
  .object({
    cuisine: optionalText,
    ingredients: terms,
    instructions: terms,
    tags: terms,
    difficulty: options(DIFFICULTIES),
    mealTypes: options(MEAL_TYPES),
    prepTimeMin: optionalCount,
    prepTimeMax: optionalCount,
    cookTimeMin: optionalCount,
    cookTimeMax: optionalCount,
    servingsMin: optionalCount,
    servingsMax: optionalCount,
    caloriesMin: optionalCount,
    caloriesMax: optionalCount,
  })
  .superRefine((filters, ctx) => {
    for (const field of RANGE_FIELDS) {
      const min = filters[`${field}Min`];
      const max = filters[`${field}Max`];

      if (min !== undefined && max !== undefined && min > max) {
        ctx.addIssue({ code: 'custom', path: [`${field}Max`], message: `Can't be below ${min}` });
      }
    }
  }) satisfies z.ZodType<RecipeFilters, unknown>;

export type RecipeFiltersFormValues = z.input<typeof recipeFiltersSchema>;

export const emptyFiltersForm: RecipeFiltersFormValues = {
  cuisine: '',
  ingredients: '',
  instructions: '',
  tags: '',
  difficulty: [],
  mealTypes: [],
  prepTimeMin: '',
  prepTimeMax: '',
  cookTimeMin: '',
  cookTimeMax: '',
  servingsMin: '',
  servingsMax: '',
  caloriesMin: '',
  caloriesMax: '',
};

const joinTerms = (list?: string[]) => list?.join(', ') ?? '';
const countText = (count?: number) => count?.toString() ?? '';

// The reverse of `recipeFiltersSchema`: turns applied filters back into form values
export const toFiltersFormValues = (filters: RecipeFilters): RecipeFiltersFormValues => ({
  cuisine: filters.cuisine ?? '',
  ingredients: joinTerms(filters.ingredients),
  instructions: joinTerms(filters.instructions),
  tags: joinTerms(filters.tags),
  difficulty: filters.difficulty ?? [],
  mealTypes: filters.mealTypes ?? [],
  prepTimeMin: countText(filters.prepTimeMin),
  prepTimeMax: countText(filters.prepTimeMax),
  cookTimeMin: countText(filters.cookTimeMin),
  cookTimeMax: countText(filters.cookTimeMax),
  servingsMin: countText(filters.servingsMin),
  servingsMax: countText(filters.servingsMax),
  caloriesMin: countText(filters.caloriesMin),
  caloriesMax: countText(filters.caloriesMax),
});

// How many filters are applied; a Min/Max pair counts once
export const countFilters = (filters: RecipeFilters) => {
  const keys = Object.entries(filters)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key.replace(/(Min|Max)$/, ''));

  return new Set(keys).size;
};
