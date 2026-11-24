import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Button, Text, View } from 'react-native';

import { RecipeForm } from '@/components/recipe-form';
import { useRecipe, useUpdateRecipe } from '@/hooks/use-recipes';
import { toRecipeFormValues } from '@/lib/recipe-schema';
import { makeStyles } from '@/lib/theme';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recipe, error, refetch, isRefetching } = useRecipe(Number(id));
  const updateRecipe = useUpdateRecipe(Number(id));
  const styles = useStyles();

  if (error && !recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Could not load this recipe</Text>
        <Text style={styles.muted}>{error.message}</Text>
        <Button
          title={isRefetching ? 'Retrying…' : 'Retry'}
          onPress={() => refetch()}
          disabled={isRefetching}
        />
      </View>
    );
  }

  // The form reads its starting values once, so render it only after the recipe has loaded
  if (!recipe) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <RecipeForm
      defaultValues={toRecipeFormValues(recipe)}
      submitLabel="Save changes"
      onSubmit={async (changes) => {
        await updateRecipe.mutateAsync(changes);
        router.back();
      }}
    />
  );
}

const useStyles = makeStyles((c) => ({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  muted: {
    color: c.muted,
  },
  error: {
    color: c.danger,
    textAlign: 'center',
  },
}));
