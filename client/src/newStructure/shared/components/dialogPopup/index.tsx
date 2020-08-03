import Button, { ButtonProps } from '@material-ui/core/Button';
import MaterialDialog, { DialogProps } from '@material-ui/core/Dialog';

import MaterialDialogActions from '@material-ui/core/DialogActions';
import MaterialDialogContent from '@material-ui/core/DialogContent';
import MaterialDialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import { useStyles } from './styles';

type DialogAction = Omit<ButtonProps, 'children'> & {
  buttonText: string;
};

interface IProps extends DialogProps {
  content?: React.ReactNode;
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  tertiaryAction?: DialogAction;
  title?: string;
  subtitle?: string;
}

export const DialogPopup: React.FC<IProps> = ({
  open,
  onClose,
  content,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  title,
  subtitle,
  ...props
}) => {
  const classes = useStyles();

  const actions = React.useMemo((): boolean => {
    return (
      primaryAction !== undefined ||
      secondaryAction !== undefined ||
      tertiaryAction !== undefined
    );
  }, [primaryAction, secondaryAction, tertiaryAction]);

  return (
    <MaterialDialog
      fullWidth={true}
      maxWidth="sm"
      open={open}
      onClose={onClose}
      {...props}>
      {title && (
        <MaterialDialogTitle id={props[`aria-labelledby`]}>
          {title}
        </MaterialDialogTitle>
      )}
      {subtitle && (
        <MaterialDialogTitle
          className={classes.subtitle}
          disableTypography={true}>
          {subtitle}
        </MaterialDialogTitle>
      )}
      {content && <MaterialDialogContent>{content}</MaterialDialogContent>}
      {actions && (
        <MaterialDialogActions className={classes.actions}>
          {tertiaryAction && (
            <div className={classes.leftActions}>
              <Button {...tertiaryAction} color="default">
                {tertiaryAction.buttonText}
              </Button>
            </div>
          )}
          <div className={classes.rightActions}>
            {secondaryAction && (
              <Button {...secondaryAction} color="default">
                {secondaryAction.buttonText}
              </Button>
            )}
            {primaryAction && (
              <Button {...primaryAction} color="primary" variant="outlined">
                {primaryAction.buttonText}
              </Button>
            )}
          </div>
        </MaterialDialogActions>
      )}
    </MaterialDialog>
  );
};
