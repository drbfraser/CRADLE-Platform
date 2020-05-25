import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import Typography from '@material-ui/core/Typography';
import classes from './styles.module.css';
import { IState } from '../utils';

interface IProps {
  setState: React.Dispatch<React.SetStateAction<IState>>;
};

export const AddNewReading: React.FC<IProps> = ({ setState }) => {
  const openReadingModal = (): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      displayReadingModal: true
    }));
  
  return (
    <>
      <Button
        className={classes.button}
        onClick={openReadingModal}
        icon={<Icon name="plus" size="large" />}
      >
        <Typography className={classes.text} variant="body2">
          Add New Reading
        </Typography>
      </Button>
      <div className={classes.clear}></div>
    </>
  );
};
