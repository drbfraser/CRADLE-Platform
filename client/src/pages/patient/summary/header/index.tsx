import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import React from 'react';
import { Title } from './title';
import { useStyles } from './styles';

interface IProps {
  title: string;
  addNewReading: () => void;
}

export const PageHeader: React.FC<IProps> = ({ title, addNewReading }) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Title title={title} />
      <Button color="primary" variant="contained" onClick={addNewReading}>
        <AddIcon />
        Add New Reading
      </Button>
    </div>
  );
};
