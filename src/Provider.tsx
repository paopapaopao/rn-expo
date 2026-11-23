import { QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren } from 'react';

import { RecipeFiltersProvider } from '@/hooks/use-recipe-filters';
import { queryClient } from '@/lib/query-client';

export const Provider = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RecipeFiltersProvider>{children}</RecipeFiltersProvider>
    </QueryClientProvider>
  );
};
