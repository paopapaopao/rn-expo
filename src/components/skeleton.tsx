import { useEffect, useState } from 'react';
import { Animated, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles } from '@/lib/theme';

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
};

// Grey block that gently pulses, standing in for content that is still loading
export const Skeleton = ({ width = '100%', height = 16, style }: Props) => {
  const styles = useStyles();
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

const useStyles = makeStyles((c) => ({
  block: {
    backgroundColor: c.fill,
    borderRadius: 6,
  },
}));
