import { Pressable, Text } from 'react-native';

import {
  makeStyles,
  setThemePreference,
  THEME_PREFERENCES,
  type ThemePreference,
  useThemePreference,
} from '@/lib/theme';

// \uFE0E asks for the plain text glyph instead of a colored emoji
const ICONS: Record<ThemePreference, string> = {
  system: '◐',
  light: '\u2600\uFE0E',
  dark: '☾',
};

const LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

// Header button that cycles the appearance: System → Light → Dark → System
export const ThemeToggle = () => {
  const styles = useStyles();
  const preference = useThemePreference();
  const next = THEME_PREFERENCES[(THEME_PREFERENCES.indexOf(preference) + 1) % 3];

  return (
    <Pressable
      onPress={() => setThemePreference(next)}
      hitSlop={8}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={`Appearance: ${LABELS[preference]}. Switch to ${LABELS[next]}`}
    >
      <Text style={styles.icon}>{ICONS[preference]}</Text>
      <Text style={styles.label}>{LABELS[preference]}</Text>
    </Pressable>
  );
};

const useStyles = makeStyles((c) => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  icon: {
    fontSize: 20,
    color: c.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: c.primary,
  },
}));
