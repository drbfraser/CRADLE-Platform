import React from 'react';

interface IProps {
  className: string;
  patientId: string;
}

export const PatientIdBody: React.FC<IProps> = ({
  className,
  patientId,
}: IProps) => {
  return <p className={className}>{patientId}</p>;
};
