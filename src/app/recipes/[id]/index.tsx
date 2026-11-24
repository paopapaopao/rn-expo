import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { RecipeImage } from '@/components/recipe-image';
import { RecipeDetailSkeleton } from '@/components/recipe-skeletons';
import { useDeleteRecipe, useRecipe } from '@/hooks/use-recipes';
import { makeStyles, useColors } from '@/lib/theme';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Asks before a destructive action. Alert.alert has no buttons on web, so use the browser's dialog there.
const confirmDelete = (name: string, onConfirm: () => void) => {
  const message = `"${name}" will be permanently deleted.`;

  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();

    return;
  }

  Alert.alert('Delete recipe?', message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
};

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recipe, error, refetch, isRefetching } = useRecipe(Number(id));
  const deleteRecipe = useDeleteRecipe(Number(id));
  const styles = useStyles();
  const colors = useColors();

  const handleDelete = () =>
    deleteRecipe.mutate(undefined, {
      // Go back to where the user came from, or Home if the recipe was opened from a link
      onSuccess: () => (router.canGoBack() ? router.back() : router.replace('/')),
    });

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
    return <RecipeDetailSkeleton />;
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
      <Stack.Screen
        options={{
          title: recipe.name,
          headerRight: () => (
            <Link href={{ pathname: '/recipes/[id]/edit', params: { id: recipe.id } }} asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.headerButton}>Edit</Text>
              </Pressable>
            </Link>
          ),
        }}
      />

      <RecipeImage uri={recipe.image} style={styles.image} iconSize={64} />
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

      {deleteRecipe.error && (
        <Text style={[styles.error, styles.deleteError]}>
          Could not delete the recipe: {deleteRecipe.error.message}
        </Text>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          (pressed || deleteRecipe.isPending) && styles.dim,
        ]}
        onPress={() => confirmDelete(recipe.name, handleDelete)}
        disabled={deleteRecipe.isPending}
      >
        {deleteRecipe.isPending ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <Text style={styles.deleteText}>Delete recipe</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  deleteButton: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: c.danger,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteText: {
    color: c.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteError: {
    marginTop: 24,
  },
  dim: {
    opacity: 0.6,
  },
  headerButton: {
    fontSize: 16,
    color: c.primary,
  },
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
    color: c.text,
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
    color: c.text,
    fontSize: 15,
    fontWeight: '600',
  },
  heading: {
    color: c.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    color: c.text,
    fontSize: 15,
    lineHeight: 22,
  },
  step: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  stepNumber: {
    color: c.text,
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
    color: c.muted,
  },
  error: {
    color: c.danger,
    textAlign: 'center',
  },
}));
