import { MTableActions } from 'material-table';
import React from 'react';
import { useStyles } from './styles';

export const Actions: React.FC<any> = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.actionsContainer}>
      <MTableActions {...props} />
    </div>
  );
};
