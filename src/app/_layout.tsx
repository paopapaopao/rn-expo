import { Tabs } from 'expo-router';

import { Provider } from '@/Provider';

export default function RootLayout() {
  return (
    <Provider>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </Provider>
  );
}
