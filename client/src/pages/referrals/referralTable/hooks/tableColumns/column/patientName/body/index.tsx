import React from 'react';
import { useStyles } from '../../../../../../../../shared/components/table/column/initials/styles';

interface IProps {
  className: string;
  patientName: string;
}

export const PatientNameBody: React.FC<IProps> = ({
  className,
  patientName,
}: IProps) => {
  const classes = useStyles();
  return <p className={`${className} ${classes.text}`}>{patientName}</p>;
};
