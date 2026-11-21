import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  onPress: () => void;
};

// Round button floating in the bottom-right corner. Place it inside a container with flex: 1.
export const ScrollToTopButton = ({ onPress }: Props) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="Scroll to top"
    hitSlop={8}
    style={({ pressed }) => [styles.button, pressed && styles.pressed]}
  >
    <Text style={styles.icon}>↑</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});
