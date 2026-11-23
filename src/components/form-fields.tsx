import { type ReactNode } from 'react';
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

// Field errors are Zod issues (from a schema) or strings (from the API)
export const firstError = (errors: unknown[]) => {
  const error = errors[0];

  return typeof error === 'string' ? error : (error as { message?: string } | undefined)?.message;
};

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

// Label, input and error message
export const Field = ({ label, hint, error, style, children }: FieldProps) => (
  <View style={[styles.field, style]}>
    <Text style={styles.label}>
      {label}
      {hint && <Text style={styles.muted}> · {hint}</Text>}
    </Text>
    {children}
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

export const Input = ({ multiline, style, ...props }: TextInputProps) => (
  <TextInput
    style={[styles.input, multiline && styles.multiline, style]}
    multiline={multiline}
    textAlignVertical={multiline ? 'top' : 'center'}
    placeholderTextColor="#999"
    {...props}
  />
);

type ChipProps = { label: string; selected: boolean; onPress: () => void };

// Toggleable pill, for picking from a few fixed options
export const Chip = ({ label, selected, onPress }: ChipProps) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: selected }}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>
);

export const Chips = ({ children }: { children: ReactNode }) => (
  <View style={styles.chips}>{children}</View>
);

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  multiline: {
    minHeight: 110,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  chipText: {
    textTransform: 'capitalize',
  },
  chipTextSelected: {
    color: '#fff',
  },
  muted: {
    color: '#666',
    fontWeight: '400',
  },
  error: {
    color: '#c00',
  },
});
