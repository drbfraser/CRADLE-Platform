import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { goBack } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { useStyles } from './styles';

interface IProps {
  title: string;
}

export const Title: React.FC<IProps> = ({ title }) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const handleClick = (): void => {
    dispatch(goBack());
  };

  return (
    <div className={classes.container}>
      <Tooltip title="Go back" placement="top">
        <IconButton onClick={handleClick}>
          <ChevronLeftIcon color="inherit" fontSize="large" />
        </IconButton>
      </Tooltip>
      <Typography variant="h4">Patient Summary for {title}</Typography>
    </div>
  );
};
