import { type ReactNode } from 'react';
import {
  Pressable,
  type StyleProp,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { makeStyles, useColors } from '@/lib/theme';

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
export const Field = ({ label, hint, error, style, children }: FieldProps) => {
  const styles = useStyles();

  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>
        {label}
        {hint && <Text style={styles.muted}> · {hint}</Text>}
      </Text>
      {children}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export const Input = ({ multiline, style, ...props }: TextInputProps) => {
  const styles = useStyles();
  const colors = useColors();

  return (
    <TextInput
      style={[styles.input, multiline && styles.multiline, style]}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      placeholderTextColor={colors.placeholder}
      {...props}
    />
  );
};

type ChipProps = { label: string; selected: boolean; onPress: () => void };

// Toggleable pill, for picking from a few fixed options
export const Chip = ({ label, selected, onPress }: ChipProps) => {
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
};

export const Chips = ({ children }: { children: ReactNode }) => {
  const styles = useStyles();

  return <View style={styles.chips}>{children}</View>;
};

const useStyles = makeStyles((c) => ({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
  },
  input: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: c.text,
    backgroundColor: c.surface,
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
    borderColor: c.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: c.surface,
  },
  chipSelected: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  chipText: {
    color: c.text,
    textTransform: 'capitalize',
  },
  chipTextSelected: {
    color: c.onPrimary,
  },
  muted: {
    color: c.muted,
    fontWeight: '400',
  },
  error: {
    color: c.danger,
  },
}));
