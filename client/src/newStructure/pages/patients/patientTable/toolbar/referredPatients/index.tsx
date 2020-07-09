import React from 'react';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import { useStyles } from './styles';

interface IProps {
  toggleShowReferredPatients: () => void;
  showReferredPatients?: boolean;
}

export const ReferredPatients: React.FC<IProps> = ({
  showReferredPatients,
  toggleShowReferredPatients,
}) => {
  const classes = useStyles();

  return (
    <Tooltip
      title={
        showReferredPatients ? `Show all patients` : `Show referred patients`
      }>
      <Switch
        className={classes.container}
        color="primary"
        checked={showReferredPatients}
        onClick={toggleShowReferredPatients}
      />
    </Tooltip>
  );
};
