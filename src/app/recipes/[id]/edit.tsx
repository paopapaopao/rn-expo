import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

import { RecipeForm } from '@/components/recipe-form';
import { useRecipe, useUpdateRecipe } from '@/hooks/use-recipes';
import { toRecipeFormValues } from '@/lib/recipe-schema';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recipe, error, refetch, isRefetching } = useRecipe(Number(id));
  const updateRecipe = useUpdateRecipe(Number(id));

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

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  muted: {
    color: '#666',
  },
  error: {
    color: '#c00',
    textAlign: 'center',
  },
});
