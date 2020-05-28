import React from 'react';
import { Icon } from 'semantic-ui-react';
import classes from './styles.module.css';


interface IProps {
  patientName: string;
  goBackToPatientsPage: () => void;
};

export const Title: React.FC<IProps> = ({
  patientName,
  goBackToPatientsPage
}) => (
  <h1 className={classes.title}>
    <Icon
      className={classes.icon}
      size="large"
      name="chevron left"
      onClick={goBackToPatientsPage}
    />
    Patient Summary : {patientName }
  </h1>
);
