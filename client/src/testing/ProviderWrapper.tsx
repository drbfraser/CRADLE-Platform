import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { MaterialUIContextProvider } from 'src/context/providers/materialUI';

const ProviderWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <MaterialUIContextProvider>{children}</MaterialUIContextProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

export default ProviderWrapper;
