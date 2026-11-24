import { useForm } from '@tanstack/react-form';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  type StyleProp,
  Text,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { Chip, Chips, Field, firstError, Input } from '@/components/form-fields';
import { ApiError, DIFFICULTIES, MEAL_TYPES, type NewRecipe } from '@/lib/api';
import { recipeFormSchema, type RecipeFormValues } from '@/lib/recipe-schema';
import { makeStyles, useColors } from '@/lib/theme';

type TextFieldName = {
  [K in keyof RecipeFormValues]: RecipeFormValues[K] extends string ? K : never;
}[keyof RecipeFormValues];

type RecipeFormProps = {
  defaultValues: RecipeFormValues;
  submitLabel: string;
  // Saves the recipe; throw to show the error on the form
  onSubmit: (recipe: NewRecipe) => Promise<void>;
};

// Form for creating or editing a recipe, validated with `recipeFormSchema`
export const RecipeForm = ({ defaultValues, submitLabel, onSubmit }: RecipeFormProps) => {
  const styles = useStyles();
  const colors = useColors();
  const form = useForm({
    defaultValues,
    validators: {
      // Validate the whole form against the schema on every change; errors go to each field
      onChange: recipeFormSchema,
      // Runs on submit once the schema passes. The API validates again, so its errors
      // (400 with per-field messages) are shown on the matching fields.
      onSubmitAsync: async ({ value }) => {
        try {
          await onSubmit(recipeFormSchema.parse(value));

          return null;
        } catch (error) {
          if (error instanceof ApiError && error.errors) {
            return {
              fields: Object.fromEntries(
                Object.entries(error.errors).map(([field, messages]) => [field, messages[0]]),
              ),
            };
          }

          return { form: `Could not save the recipe: ${(error as Error).message}` };
        }
      },
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
            {...inputProps}
          />
        </Field>
      )}
    </form.Field>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {textField('name', 'Name', { placeholder: 'Classic Margherita Pizza' })}
      {textField(
        'image',
        'Image URL',
        {
          placeholder: 'https://…',
          autoCapitalize: 'none',
          autoCorrect: false,
          keyboardType: 'url',
        },
        'Optional',
      )}
      {textField('ingredients', 'Ingredients', { multiline: true }, 'One per line')}
      {textField('instructions', 'Instructions', { multiline: true }, 'One step per line')}

      <View style={styles.row}>
        {textField(
          'prepTime',
          'Prep (min)',
          { keyboardType: 'number-pad' },
          undefined,
          styles.half,
        )}
        {textField(
          'cookTime',
          'Cook (min)',
          { keyboardType: 'number-pad' },
          undefined,
          styles.half,
        )}
      </View>

      <View style={styles.row}>
        {textField('servings', 'Servings', { keyboardType: 'number-pad' }, undefined, styles.half)}
        {textField(
          'calories',
          'Calories / serving',
          { keyboardType: 'number-pad' },
          undefined,
          styles.half,
        )}
      </View>

      <form.Field name="difficulty">
        {(field) => (
          <Field label="Difficulty" error={firstError(field.state.meta.errors)}>
            <Chips>
              {DIFFICULTIES.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  selected={field.state.value === d}
                  onPress={() => field.handleChange(field.state.value === d ? null : d)}
                />
              ))}
            </Chips>
          </Field>
        )}
      </form.Field>

      <form.Field name="mealTypes">
        {(field) => (
          <Field label="Meal types" error={firstError(field.state.meta.errors)}>
            <Chips>
              {MEAL_TYPES.map((m) => {
                const selected = field.state.value.includes(m);

                return (
                  <Chip
                    key={m}
                    label={m}
                    selected={selected}
                    onPress={() =>
                      field.handleChange(
                        selected
                          ? field.state.value.filter((value) => value !== m)
                          : [...field.state.value, m],
                      )
                    }
                  />
                );
              })}
            </Chips>
          </Field>
        )}
      </form.Field>

      {textField('cuisine', 'Cuisine', { placeholder: 'Italian' })}
      {textField(
        'tags',
        'Tags',
        { placeholder: 'Pizza, Vegetarian', autoCapitalize: 'none' },
        'Separated by commas',
      )}

      <form.Subscribe selector={(state) => [state.isSubmitting, state.errorMap.onSubmit] as const}>
        {([isSubmitting, formError]) => (
          <>
            {typeof formError === 'string' && <Text style={styles.error}>{formError}</Text>}

            <Pressable
              style={({ pressed }) => [styles.submit, (pressed || isSubmitting) && styles.dim]}
              onPress={() => form.handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.submitText}>{submitLabel}</Text>
              )}
            </Pressable>
          </>
        )}
      </form.Subscribe>
    </ScrollView>
  );
};

const useStyles = makeStyles((c) => ({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  submit: {
    backgroundColor: c.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: c.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  dim: {
    opacity: 0.6,
  },
  error: {
    color: c.danger,
  },
}));
