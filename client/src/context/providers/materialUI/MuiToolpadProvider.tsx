import { AppProvider } from '@toolpad/core/AppProvider'; // MUI Toolpad.
import { DialogsProvider } from '@toolpad/core/useDialogs';

import { theme } from 'src/context/providers/materialUI/theme';
import { PropsWithChildren } from 'react';

export const MuiToolpadProvider = ({ children }: PropsWithChildren) => {
  return (
    <AppProvider theme={theme}>
      <DialogsProvider>{children}</DialogsProvider>
    </AppProvider>
  );
};
