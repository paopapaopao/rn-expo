import { Link } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListViewToken,
} from 'react-native';

import { RecipeImage } from '@/components/recipe-image';
import { ScrollToTopButton } from '@/components/scroll-to-top-button';
import { useRecipes } from '@/hooks/use-recipes';
import { API_URL, type Recipe } from '@/lib/api';

// Show the scroll-to-top button once this many recipes have scrolled off the top
const SHOW_SCROLL_TOP_AFTER_ITEMS = 3;

export default function HomeScreen() {
  const {
    data: recipes,
    error,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useRecipes();
  // Tracks only user-initiated refreshes, so background refetches don't show the spinner
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<Recipe>>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // FlatList requires this callback to never change, hence useCallback with no dependencies
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ListViewToken[] }) => {
      const firstVisible = viewableItems[0]?.index ?? 0;
      setShowScrollTop(firstVisible >= SHOW_SCROLL_TOP_AFTER_ITEMS);
    },
    [],
  );

  const refresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (error && !recipes) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Could not reach the API at {API_URL}</Text>
        <Text style={styles.muted}>{error.message}</Text>
        <Button
          title={isRefetching ? 'Retrying…' : 'Retry'}
          onPress={() => refetch()}
          disabled={isRefetching}
        />
      </View>
    );
  }

  if (!recipes) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        ref={listRef}
        data={recipes}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={styles.list}
        onViewableItemsChanged={onViewableItemsChanged}
        // Load the next page when the user is within half a screen of the bottom.
        // Skip after a failed load so it doesn't retry in a loop; the footer has a Retry button.
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} />
          ) : isFetchNextPageError ? (
            <View style={styles.footer}>
              <Text style={styles.error}>Could not load more recipes</Text>
              <Button title="Retry" onPress={() => fetchNextPage()} />
            </View>
          ) : !hasNextPage && recipes.length > 0 ? (
            <Text style={[styles.muted, styles.footer, styles.end]}>
              {recipes.length === 1
                ? 'That’s the only recipe'
                : `You’ve seen all ${recipes.length} recipes`}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={<Text style={styles.muted}>No recipes yet.</Text>}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/recipes/[id]', params: { id: item.id } }} asChild>
            <Pressable>
              {({ pressed }) => (
                <View style={[styles.row, pressed && styles.pressed]}>
                  <RecipeImage uri={item.image} style={styles.image} iconSize={24} />
                  <View style={styles.rowText}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.muted}>
                      {[item.cuisine, item.difficulty].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
          </Link>
        )}
      />
      {showScrollTop && (
        <ScrollToTopButton
          onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  list: {
    padding: 16,
    // Room for the scroll-to-top button so it doesn't cover the last recipe
    paddingBottom: 88,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.6,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  footer: {
    paddingVertical: 16,
    gap: 8,
  },
  end: {
    textAlign: 'center',
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  muted: {
    color: '#666',
  },
  error: {
    color: '#c00',
    textAlign: 'center',
  },
});
