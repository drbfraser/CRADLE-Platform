import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { useStyles } from './styles';
import { goBackWithFallback } from 'src/shared/utils';

interface IProps {
  title: string;
}

export const Title: React.FC<IProps> = ({ title }) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Tooltip title="Go back" placement="top">
        <IconButton onClick={() => goBackWithFallback('/patients')}>
          <ChevronLeftIcon color="inherit" fontSize="large" />
        </IconButton>
      </Tooltip>
      <Typography variant="h4">Patient Summary for {title}</Typography>
    </div>
  );
};
