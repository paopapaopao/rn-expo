import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient();

// On web, TanStack Query already listens to the browser's focus and online events.
// On native, wire them to the app state and the device's network state instead.
if (Platform.OS !== 'web') {
  // Refetch stale queries when the app comes back to the foreground
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener('change', (status) => {
      handleFocus(status === 'active');
    });

    return () => subscription.remove();
  });

  // Pause queries while offline and resume them when the connection returns
  onlineManager.setEventListener((setOnline) => {
    let initialized = false;

    const subscription = Network.addNetworkStateListener((state) => {
      initialized = true;
      setOnline(!!state.isConnected);
    });

    Network.getNetworkStateAsync()
      .then((state) => {
        if (!initialized) {
          setOnline(!!state.isConnected);
        }
      })
      .catch(() => {
        // Keep the default (online) if the network state can't be read
      });

    return () => subscription.remove();
  });
}
