import { useState } from 'react';
import { Image, type ImageStyle, type StyleProp, StyleSheet, Text, View } from 'react-native';

import { NO_IMAGE } from '@/lib/api';

type Props = {
  uri: string;
  style: StyleProp<ImageStyle>;
  // Size of the placeholder icon
  iconSize: number;
};

// Shows the recipe's photo, or a placeholder when it has none or the URL fails to load
export const RecipeImage = ({ uri, style, iconSize }: Props) => {
  const [failedUri, setFailedUri] = useState<string | null>(null);

  if (uri !== NO_IMAGE && uri !== failedUri) {
    return <Image source={{ uri }} style={style} onError={() => setFailedUri(uri)} />;
  }

  return (
    <View style={[style, styles.placeholder]} accessibilityLabel="No image">
      <Text style={{ fontSize: iconSize }}>🍽️</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#e4e4e4',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
