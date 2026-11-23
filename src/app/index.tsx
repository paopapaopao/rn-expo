import { Link } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecipeImage } from '@/components/recipe-image';
import { RecipeRowSkeletons } from '@/components/recipe-skeletons';
import { ScrollToTopButton } from '@/components/scroll-to-top-button';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useRecipeFilters } from '@/hooks/use-recipe-filters';
import { useRecipes } from '@/hooks/use-recipes';
import { API_URL, RECIPES_PAGE_SIZE, type Recipe } from '@/lib/api';
import { countFilters } from '@/lib/recipe-filters-schema';

// Show the scroll-to-top button once this many recipes have scrolled off the top
const SHOW_SCROLL_TOP_AFTER_ITEMS = 3;

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const insets = useSafeAreaInsets();
  // Search only once the user pauses typing, instead of on every keystroke
  const name = useDebouncedValue(searchText.trim(), 300);
  // Advanced search filters, set on the Advanced search screen
  const { filters, setFilters } = useRecipeFilters();
  const filterCount = countFilters(filters);
  const isSearching = name !== '' || filterCount > 0;
  const {
    data: recipes,
    error,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isPlaceholderData,
  } = useRecipes({ name: name || undefined, ...filters });
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

  const changeSearch = (text: string) => {
    setSearchText(text);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  // New filters mean a new list, so start it from the top
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [filters]);

  const renderContent = () => {
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
        <View style={styles.list} accessibilityLabel="Loading recipes">
          <RecipeRowSkeletons count={RECIPES_PAGE_SIZE} />
        </View>
      );
    }

    return (
      <FlatList
        ref={listRef}
        data={recipes}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={refresh}
        // Dim the previous results while a new search loads
        style={isPlaceholderData && styles.stale}
        // Extra bottom room so the last recipe clears the gesture bar
        contentContainerStyle={[styles.list, { paddingBottom: 88 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onViewableItemsChanged={onViewableItemsChanged}
        // Load the next page when the user is within half a screen of the bottom.
        // Skip after a failed load so it doesn't retry in a loop; the footer has a Retry button.
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <RecipeRowSkeletons count={2} />
          ) : isFetchNextPageError ? (
            <View style={styles.footer}>
              <Text style={styles.error}>Could not load more recipes</Text>
              <Button title="Retry" onPress={() => fetchNextPage()} />
            </View>
          ) : !hasNextPage && recipes.length > 0 ? (
            <Text style={[styles.muted, styles.footer, styles.end]}>
              {isSearching
                ? `${recipes.length} ${recipes.length === 1 ? 'recipe matches' : 'recipes match'} your search`
                : recipes.length === 1
                  ? 'That’s the only recipe'
                  : `You’ve seen all ${recipes.length} recipes`}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={
          <Text style={[styles.muted, styles.end]}>
            {isSearching ? 'No recipes match your search' : 'No recipes yet.'}
          </Text>
        }
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
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <TextInput
            value={searchText}
            onChangeText={changeSearch}
            placeholder="Search by name"
            placeholderTextColor="#888"
            style={styles.searchInput}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search recipes by name"
          />
          {searchText.length > 0 && (
            <Pressable
              onPress={() => changeSearch('')}
              hitSlop={8}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Text style={styles.clearText}>✕</Text>
            </Pressable>
          )}
        </View>
        <Link href="/recipes/filters" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              filterCount > 0
                ? `Advanced search, ${filterCount} filters applied`
                : 'Advanced search'
            }
          >
            {/* Link asChild drops a function `style` on Pressable, so style an inner View instead */}
            {({ pressed }) => (
              <View
                style={[
                  styles.filtersButton,
                  filterCount > 0 && styles.filtersButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filtersText, filterCount > 0 && styles.filtersTextActive]}>
                  {filterCount > 0 ? `Filters · ${filterCount}` : 'Filters'}
                </Text>
              </View>
            )}
          </Pressable>
        </Link>
      </View>

      {filterCount > 0 && (
        <View style={styles.activeFilters}>
          <Text style={styles.muted}>
            {filterCount} {filterCount === 1 ? 'filter' : 'filters'} applied
          </Text>
          <Pressable onPress={() => setFilters({})} hitSlop={8} accessibilityRole="button">
            <Text style={styles.link}>Clear filters</Text>
          </Pressable>
        </View>
      )}

      {renderContent()}

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
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#e8e8e8',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  filtersButton: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#e8e8e8',
  },
  filtersButtonActive: {
    backgroundColor: '#1a73e8',
  },
  filtersText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a73e8',
  },
  filtersTextActive: {
    color: '#fff',
  },
  activeFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 10,
  },
  link: {
    color: '#1a73e8',
    fontWeight: '600',
  },
  clearButton: {
    paddingLeft: 8,
  },
  clearText: {
    fontSize: 16,
    color: '#666',
  },
  stale: {
    opacity: 0.5,
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
    // (the list adds the bottom safe-area inset on top of this)
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
