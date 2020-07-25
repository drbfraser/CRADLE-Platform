import { AddNewReading } from './addNewReading';
import React from 'react';
import { Title } from './title';
import { useStyles } from './styles';

interface IProps {
  title: string;
  openReadingModal: () => void;
}

export const PageHeader: React.FC<IProps> = ({ title, openReadingModal }) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Title title={title} />
      <AddNewReading openReadingModal={openReadingModal} />
    </div>
  );
};
