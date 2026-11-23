import { useForm } from '@tanstack/react-form';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Chips, Field, firstError, Input } from '@/components/form-fields';
import { useRecipeFilters } from '@/hooks/use-recipe-filters';
import { DIFFICULTIES, MEAL_TYPES } from '@/lib/api';
import {
  emptyFiltersForm,
  RANGE_FIELDS,
  recipeFiltersSchema,
  type RecipeFiltersFormValues,
  toFiltersFormValues,
} from '@/lib/recipe-filters-schema';

type TextFieldName = {
  [K in keyof RecipeFiltersFormValues]: RecipeFiltersFormValues[K] extends string ? K : never;
}[keyof RecipeFiltersFormValues];

const RANGE_LABELS: Record<(typeof RANGE_FIELDS)[number], string> = {
  prepTime: 'Prep time (min)',
  cookTime: 'Cook time (min)',
  servings: 'Servings',
  calories: 'Calories / serving',
};

// Adds `value` to the list, or removes it if already there
const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

export default function FiltersScreen() {
  const { filters, setFilters } = useRecipeFilters();
  const insets = useSafeAreaInsets();

  const form = useForm({
    defaultValues: toFiltersFormValues(filters),
    validators: { onChange: recipeFiltersSchema },
    onSubmit: ({ value }) => {
      setFilters(recipeFiltersSchema.parse(value));
      router.back();
    },
  });

  const textField = (
    name: TextFieldName,
    label: string,
    inputProps?: TextInputProps,
    hint?: string,
    style?: StyleProp<ViewStyle>,
  ) => (
    <form.Field name={name}>
      {(field) => (
        <Field
          label={label}
          hint={hint}
          style={style}
          error={field.state.meta.isTouched ? firstError(field.state.meta.errors) : undefined}
        >
          <Input
            value={field.state.value}
            onChangeText={field.handleChange}
            onBlur={field.handleBlur}
            autoCorrect={false}
            {...inputProps}
          />
        </Field>
      )}
    </form.Field>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {textField('cuisine', 'Cuisine', { placeholder: 'Italian' })}
        {textField(
          'ingredients',
          'Ingredients',
          { placeholder: 'tomato, basil', autoCapitalize: 'none' },
          'Has all of these',
        )}
        {textField(
          'instructions',
          'Instructions',
          { placeholder: 'oven', autoCapitalize: 'none' },
          'Mentions all of these',
        )}
        {textField(
          'tags',
          'Tags',
          { placeholder: 'vegetarian', autoCapitalize: 'none' },
          'Has all of these',
        )}

        <form.Field name="difficulty">
          {(field) => (
            <Field label="Difficulty" hint="Any of these">
              <Chips>
                {DIFFICULTIES.map((d) => (
                  <Chip
                    key={d}
                    label={d}
                    selected={field.state.value.includes(d)}
                    onPress={() => field.handleChange(toggle(field.state.value, d))}
                  />
                ))}
              </Chips>
            </Field>
          )}
        </form.Field>

        <form.Field name="mealTypes">
          {(field) => (
            <Field label="Meal types" hint="Any of these">
              <Chips>
                {MEAL_TYPES.map((m) => (
                  <Chip
                    key={m}
                    label={m}
                    selected={field.state.value.includes(m)}
                    onPress={() => field.handleChange(toggle(field.state.value, m))}
                  />
                ))}
              </Chips>
            </Field>
          )}
        </form.Field>

        {RANGE_FIELDS.map((range) => (
          <View key={range} style={styles.range}>
            <Text style={styles.rangeLabel}>{RANGE_LABELS[range]}</Text>
            <View style={styles.row}>
              {textField(
                `${range}Min`,
                'Min',
                { keyboardType: 'number-pad', placeholder: 'Any' },
                undefined,
                styles.flex,
              )}
              {textField(
                `${range}Max`,
                'Max',
                { keyboardType: 'number-pad', placeholder: 'Any' },
                undefined,
                styles.flex,
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <Pressable
          style={({ pressed }) => [styles.button, styles.resetButton, pressed && styles.dim]}
          // Clears the form only; nothing changes until "Show results"
          onPress={() => form.reset(emptyFiltersForm, { keepDefaultValues: true })}
        >
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.button, styles.applyButton, pressed && styles.dim]}
          onPress={() => form.handleSubmit()}
        >
          <Text style={styles.applyText}>Show results</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  flex: {
    flex: 1,
  },
  range: {
    gap: 8,
  },
  rangeLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetButton: {
    borderWidth: 1,
    borderColor: '#1a73e8',
  },
  resetText: {
    color: '#1a73e8',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#1a73e8',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dim: {
    opacity: 0.6,
  },
});
