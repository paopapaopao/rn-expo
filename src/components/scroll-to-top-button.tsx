import { Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles } from '@/lib/theme';

type Props = {
  onPress: () => void;
};

// Round button floating in the bottom-right corner. Place it inside a container with flex: 1.
export const ScrollToTopButton = ({ onPress }: Props) => {
  // Stay clear of the home indicator / gesture bar
  const insets = useSafeAreaInsets();
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Scroll to top"
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        { bottom: 20 + insets.bottom },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.icon}>↑</Text>
    </Pressable>
  );
};

const useStyles = makeStyles((c) => ({
  button: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 2px 6px ${c.shadow}`,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    color: c.onPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
}));
