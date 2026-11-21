import { router } from 'expo-router';

import { RecipeForm } from '@/components/recipe-form';
import { useCreateRecipe } from '@/hooks/use-recipes';
import { emptyRecipeForm } from '@/lib/recipe-schema';

export default function NewRecipeScreen() {
  const createRecipe = useCreateRecipe();

  return (
    <RecipeForm
      defaultValues={emptyRecipeForm}
      submitLabel="Create recipe"
      onSubmit={async (recipe) => {
        const created = await createRecipe.mutateAsync(recipe);
        // Replace the form so "back" from the new recipe returns to the list
        router.replace({ pathname: '/recipes/[id]', params: { id: created.id } });
      }}
    />
  );
}
