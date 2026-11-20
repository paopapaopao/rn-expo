import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useRecipe } from '@/hooks/use-recipes';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recipe, error, refetch, isRefetching } = useRecipe(Number(id));

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

  if (!recipe) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const details = [
    ['Prep', recipe.prepTime != null ? `${recipe.prepTime} min` : null],
    ['Cook', recipe.cookTime != null ? `${recipe.cookTime} min` : null],
    ['Servings', recipe.servings],
    ['Calories', recipe.calories != null ? `${recipe.calories} / serving` : null],
    ['Difficulty', recipe.difficulty && capitalize(recipe.difficulty)],
    ['Cuisine', recipe.cuisine],
  ].filter(([, value]) => value != null);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: recipe.name }} />

      <Image source={{ uri: recipe.image }} style={styles.image} />
      <Text style={styles.title}>{recipe.name}</Text>

      {details.length > 0 && (
        <View style={styles.details}>
          {details.map(([label, value]) => (
            <View key={label} style={styles.detail}>
              <Text style={styles.muted}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.heading}>Ingredients</Text>
      {recipe.ingredients.map((ingredient, i) => (
        <Text key={i} style={styles.body}>
          • {ingredient}
        </Text>
      ))}

      <Text style={styles.heading}>Instructions</Text>
      {recipe.instructions.map((step, i) => (
        <View key={i} style={styles.step}>
          <Text style={styles.stepNumber}>{i + 1}.</Text>
          <Text style={[styles.body, styles.stepText]}>{step}</Text>
        </View>
      ))}

      {recipe.tags && recipe.tags.length > 0 && (
        <Text style={[styles.muted, styles.tags]}>
          {recipe.tags.map((t) => `#${t}`).join('  ')}
        </Text>
      )}
    </ScrollView>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  detail: {
    minWidth: 90,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  step: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
  },
  tags: {
    marginTop: 24,
  },
  muted: {
    color: '#666',
  },
  error: {
    color: '#c00',
    textAlign: 'center',
  },
});
