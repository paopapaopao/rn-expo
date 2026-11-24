import { DarkTheme, DefaultTheme, Link, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ThemeToggle } from '@/components/theme-toggle';
import { makeStyles, palettes, useScheme } from '@/lib/theme';
import { Provider } from '@/Provider';

export default function RootLayout() {
  const scheme = useScheme();
  const styles = useStyles();

  // Headers, screen backgrounds and navigation colors follow the app's palette
  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    const c = palettes[scheme];

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: c.primary,
        background: c.background,
        card: c.surface,
        text: c.text,
        border: c.border,
      },
    };
  }, [scheme]);

  // The native window behind the app, visible briefly during screen transitions
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(palettes[scheme].background);
  }, [scheme]);

  return (
    <Provider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'Home',
              headerRight: () => (
                <View style={styles.headerButtons}>
                  <ThemeToggle />
                  <Link href="/recipes/new" asChild>
                    <Pressable
                      hitSlop={8}
                      style={styles.headerButton}
                      accessibilityLabel="New recipe"
                    >
                      <Text style={styles.headerButtonText}>+</Text>
                    </Pressable>
                  </Link>
                </View>
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
      </ThemeProvider>
    </Provider>
  );
}

const useStyles = makeStyles((c) => ({
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 8,
  },
  headerButtonText: {
    fontSize: 28,
    color: c.primary,
  },
}));
