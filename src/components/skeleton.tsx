import { useEffect, useState } from 'react';
import {
  Animated,
  type DimensionValue,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
};

// Grey block that gently pulses, standing in for content that is still loading
export const Skeleton = ({ width = '100%', height = 16, style }: Props) => {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return <Animated.View style={[styles.block, { width, height, opacity }, style]} />;
};

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#e4e4e4',
    borderRadius: 6,
  },
});
