import { z } from 'zod';

import { DIFFICULTIES, MEAL_TYPES, type NewRecipe, NO_IMAGE, type Recipe } from '@/lib/api';

// Rules mirror the API's validation in express-drizzle/src/routers/recipes.ts.
// Inputs are the form's raw values (text fields are strings); outputs are a `NewRecipe`.

// One entry per non-empty line
const lines = (message: string) =>
  z
    .string()
    .transform((text) =>
      text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string()).min(1, message));

// Optional whole number: empty becomes null
const optionalInt = (min: number) =>
  z
    .string()
    .trim()
    .refine((text) => text === '' || (/^\d+$/.test(text) && Number(text) >= min), {
      message: min > 0 ? `Enter a whole number of at least ${min}` : 'Enter a whole number',
    })
    .transform((text) => (text === '' ? null : Number(text)));

export const recipeFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name'),
  image: z
    .string()
    .trim()
    .transform((text) => text || NO_IMAGE),
  ingredients: lines('Add at least one ingredient'),
  instructions: lines('Add at least one step'),
  prepTime: optionalInt(0),
  cookTime: optionalInt(0),
  servings: optionalInt(1),
  calories: optionalInt(0),
  difficulty: z.enum(DIFFICULTIES).nullable(),
  cuisine: z
    .string()
    .trim()
    .transform((text) => text || null),
  mealTypes: z.array(z.enum(MEAL_TYPES)).transform((types) => (types.length > 0 ? types : null)),
  // Comma-separated; empty becomes null
  tags: z.string().transform((text) => {
    const tags = text
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    return tags.length > 0 ? tags : null;
  }),
}) satisfies z.ZodType<NewRecipe, unknown>;

export type RecipeFormValues = z.input<typeof recipeFormSchema>;

export const emptyRecipeForm: RecipeFormValues = {
  name: '',
  image: '',
  ingredients: '',
  instructions: '',
  prepTime: '',
  cookTime: '',
  servings: '',
  calories: '',
  difficulty: null,
  cuisine: '',
  mealTypes: [],
  tags: '',
};

// The reverse of `recipeFormSchema`: turns a saved recipe into form values for editing
export const toRecipeFormValues = (recipe: Recipe): RecipeFormValues => ({
  name: recipe.name,
  image: recipe.image === NO_IMAGE ? '' : recipe.image,
  ingredients: recipe.ingredients.join('\n'),
  instructions: recipe.instructions.join('\n'),
  prepTime: recipe.prepTime?.toString() ?? '',
  cookTime: recipe.cookTime?.toString() ?? '',
  servings: recipe.servings?.toString() ?? '',
  calories: recipe.calories?.toString() ?? '',
  difficulty: recipe.difficulty,
  cuisine: recipe.cuisine ?? '',
  mealTypes: recipe.mealTypes ?? [],
  tags: recipe.tags?.join(', ') ?? '',
});
