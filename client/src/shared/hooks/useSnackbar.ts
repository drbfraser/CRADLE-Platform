import { useState } from 'react';
import { SnackbarSeverity } from 'src/shared/enums';

export type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

export function useSnackbar(
  defaultSeverity: SnackbarSeverity = SnackbarSeverity.SUCCESS
) {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: defaultSeverity,
  });

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return { snackbar, showSnackbar, handleCloseSnackbar };
}
