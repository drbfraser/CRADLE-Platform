import React from 'react';
import {
  AlertMessage as AlertMessageComponent,
  AlertMessageProps,
} from 'src/shared/components/alertMessage';

export const useAlertMessage = () => {
  const [open, setOpen] = React.useState<boolean>(false);

  const displayAlertMessage = React.useCallback(() => {
    setOpen(true);

    const handleFlash = setTimeout(() => {
      setOpen(false);
    }, 5000);

    return () => clearTimeout(handleFlash);
  }, [setOpen]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const AlertMessage = ({ status }: Pick<AlertMessageProps, 'status'>) => {
    const alertMessage = React.useMemo(
      () => (
        <AlertMessageComponent
          status={status}
          open={open}
          handleClose={handleClose}
        />
      ),
      [open, handleClose]
    );
    return alertMessage;
  };
  return {
    AlertMessage,
    displayAlertMessage,
  };
};
