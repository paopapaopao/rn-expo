import { Link, Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
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
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 16,
  },
  headerButtonText: {
    fontSize: 28,
    color: '#1a73e8',
  },
});
