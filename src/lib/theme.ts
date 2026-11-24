import { useSyncExternalStore } from 'react';
import { Appearance, Platform, StyleSheet, useColorScheme } from 'react-native';

import { preferenceStorage } from '@/lib/preference-storage';

const light = {
  // Screen background
  background: '#f2f2f2',
  // Cards, inputs, headers
  surface: '#ffffff',
  text: '#1c1c1e',
  muted: '#666666',
  placeholder: '#999999',
  border: '#cccccc',
  // Filled controls (search bar) and loading placeholders
  fill: '#e6e6e6',
  primary: '#1a73e8',
  // Text on a primary background
  onPrimary: '#ffffff',
  danger: '#cc0000',
  shadow: 'rgba(0, 0, 0, 0.25)',
};

export type Colors = typeof light;

const dark: Colors = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#f2f2f2',
  muted: '#a3a3a3',
  placeholder: '#777777',
  border: '#3d3d3d',
  fill: '#2c2c2c',
  primary: '#5b9bf8',
  onPrimary: '#ffffff',
  danger: '#ff6b6b',
  shadow: 'rgba(0, 0, 0, 0.6)',
};

// ---- The user's appearance choice, saved on the device ----

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

const STORAGE_KEY = 'theme-preference';

const readPreference = (): ThemePreference => {
  const saved = preferenceStorage.get(STORAGE_KEY);

  return THEME_PREFERENCES.includes(saved as ThemePreference)
    ? (saved as ThemePreference)
    : 'system';
};

let preference = readPreference();
const listeners = new Set<() => void>();

// Tell the OS too, so native UI (alerts, keyboard) matches. 'unspecified' means follow the phone.
// Web has no such API; there the app's own colors are all that change.
const apply = (value: ThemePreference) => {
  if (Platform.OS !== 'web') Appearance.setColorScheme(value === 'system' ? 'unspecified' : value);
};

// Apply the saved choice as soon as the app loads
apply(preference);

export const setThemePreference = (value: ThemePreference) => {
  preference = value;
  preferenceStorage.set(STORAGE_KEY, value);
  apply(value);
  listeners.forEach((listener) => listener());
};

export const useThemePreference = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    () => preference,
  );

export const palettes = { light, dark };

export type Scheme = keyof typeof palettes;

// The scheme currently shown: the user's choice, or the phone's setting when on "system"
export const useScheme = (): Scheme => {
  const choice = useThemePreference();
  const system = useColorScheme();

  if (choice !== 'system') return choice;

  return system === 'dark' ? 'dark' : 'light';
};

export const useColors = (): Colors => palettes[useScheme()];

// Defines styles that depend on the theme. Each scheme's StyleSheet is built once, on first use.
//   const useStyles = makeStyles((c) => ({ title: { color: c.text } }));
//   const styles = useStyles(); // inside a component
type StyleDefinitions = Parameters<typeof StyleSheet.create>[0];

export const makeStyles = <T extends StyleDefinitions>(factory: (c: Colors) => T) => {
  const cache: Partial<Record<Scheme, Readonly<T>>> = {};

  return (): Readonly<T> => {
    const scheme = useScheme();
    cache[scheme] ??= StyleSheet.create(factory(palettes[scheme]));

    return cache[scheme];
  };
};
