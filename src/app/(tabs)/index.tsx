import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRecipes } from '@/hooks/use-recipes';
import { API_URL } from '@/lib/api';

export default function HomeScreen() {
  const { data: recipes, error, refetch, isRefetching } = useRecipes();
  // Tracks only user-initiated refreshes, so background refetches don't show the spinner
  const [refreshing, setRefreshing] = useState(false);

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
    <FlatList
      data={recipes}
      keyExtractor={(item) => String(item.id)}
      refreshing={refreshing}
      onRefresh={refresh}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.muted}>No recipes yet.</Text>}
      renderItem={({ item }) => (
        <Link href={{ pathname: '/recipes/[id]', params: { id: item.id } }} asChild>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.row, pressed && styles.pressed]}>
                <Image source={{ uri: item.image }} style={styles.image} />
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
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  list: {
    padding: 16,
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
