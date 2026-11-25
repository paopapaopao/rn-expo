import { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles } from '@/lib/theme';
import { useToast } from '@/lib/toast';

// Renders the message from showToast. Mount once, at the root, so it stays visible across navigation.
export const Toast = () => {
  const { message, visible, id } = useToast();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // Restart from hidden for every new toast, then slide in; slide out when it expires
    if (visible) progress.setValue(0);

    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [visible, id, progress]);

  if (!message) return null;

  return (
    <Animated.View
      // Taps go through to whatever is underneath, e.g. the scroll-to-top button
      pointerEvents="none"
      style={[
        styles.toast,
        {
          bottom: 24 + insets.bottom,
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
        },
      ]}
    >
      <Animated.Text style={styles.text} numberOfLines={2}>
        {message}
      </Animated.Text>
    </Animated.View>
  );
};

// Inverted colors (dark on light, light on dark) so it stands out from the screen
const useStyles = makeStyles((c) => ({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: c.text,
    boxShadow: `0 2px 8px ${c.shadow}`,
  },
  text: {
    color: c.background,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
}));
