import { type DimensionValue, StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/skeleton';

// Same shape as a recipe row on the Home list
export const RecipeRowSkeleton = () => (
  <View style={styles.row}>
    <Skeleton width={56} height={56} style={styles.rowImage} />
    <View style={styles.rowText}>
      <Skeleton width="70%" height={18} />
      <Skeleton width="40%" height={14} />
    </View>
  </View>
);

// Several rows, stacked with the list's spacing
export const RecipeRowSkeletons = ({ count }: { count: number }) => (
  <View style={styles.rows}>
    {Array.from({ length: count }, (_, i) => (
      <RecipeRowSkeleton key={i} />
    ))}
  </View>
);

// Varied widths so the lines look like text
const INGREDIENT_LINES: DimensionValue[] = ['80%', '60%', '70%', '50%'];
const STEP_LINES: DimensionValue[] = ['95%', '85%', '90%'];

// Same shape as the recipe screen: photo, title, details, then ingredient and step lines
export const RecipeDetailSkeleton = () => (
  <View style={styles.detail} accessibilityLabel="Loading recipe">
    <Skeleton height="auto" style={styles.image} />
    <Skeleton width="65%" height={28} style={styles.title} />

    <View style={styles.details}>
      {Array.from({ length: 4 }, (_, i) => (
        <View key={i} style={styles.detailItem}>
          <Skeleton width={50} height={12} />
          <Skeleton width={70} height={16} />
        </View>
      ))}
    </View>

    <Skeleton width={120} height={20} style={styles.heading} />
    {INGREDIENT_LINES.map((width, i) => (
      <Skeleton key={i} width={width} height={15} style={styles.line} />
    ))}

    <Skeleton width={120} height={20} style={styles.heading} />
    {STEP_LINES.map((width, i) => (
      <Skeleton key={i} width={width} height={15} style={styles.line} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  rows: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowImage: {
    borderRadius: 8,
  },
  rowText: {
    flex: 1,
    gap: 8,
  },
  detail: {
    padding: 16,
  },
  image: {
    aspectRatio: 4 / 3,
    borderRadius: 12,
  },
  title: {
    marginTop: 16,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  detailItem: {
    minWidth: 90,
    gap: 4,
  },
  heading: {
    marginTop: 28,
    marginBottom: 12,
  },
  line: {
    marginBottom: 10,
  },
});
