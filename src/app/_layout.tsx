import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Provider } from '@/Provider';

export default function RootLayout() {
  return (
    <Provider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Home',
            headerRight: () => (
              <Link href="/recipes/new" asChild>
                <Pressable hitSlop={8} style={styles.headerButton} accessibilityLabel="New recipe">
                  <Text style={styles.headerButtonText}>+</Text>
                </Pressable>
              </Link>
            ),
          }}
        />
        <Stack.Screen name="recipes/new" options={{ title: 'New recipe' }} />
        <Stack.Screen name="recipes/[id]/index" options={{ title: 'Recipe' }} />
        <Stack.Screen name="recipes/[id]/edit" options={{ title: 'Edit recipe' }} />
        <Stack.Screen
          name="recipes/filters"
          options={{ title: 'Advanced search', presentation: 'modal' }}
        />
      </Stack>
    </Provider>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 8,
  },
  headerButtonText: {
    fontSize: 28,
    color: '#1a73e8',
  },
});
