import { Stack } from 'expo-router';

import { Provider } from '@/Provider';

export default function RootLayout() {
  return (
    <Provider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
