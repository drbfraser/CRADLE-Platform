import React from 'react';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import { toggleShowReferredPatients } from '../../../../../shared/reducers/patients';
import { useDispatch } from 'react-redux';
import { useStyles } from './styles';

interface IProps {
  showReferredPatients?: boolean;
}

export const ReferredPatients: React.FC<IProps> = ({
  showReferredPatients,
}) => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const handleClick = (): void => {
    dispatch(toggleShowReferredPatients());
  };

  return (
    <Tooltip
      title={
        showReferredPatients ? `Show all patients` : `Show referred patients`
      }>
      <Switch
        className={classes.container}
        color="primary"
        checked={showReferredPatients}
        onClick={handleClick}
      />
    </Tooltip>
  );
};
