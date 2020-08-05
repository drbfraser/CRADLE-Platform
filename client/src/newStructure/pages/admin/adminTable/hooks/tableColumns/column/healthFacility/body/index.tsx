import React from 'react';

interface IProps {
  className: string;
  healthFacility: string;
}

export const HealthFacilityBody: React.FC<IProps> = ({
  className,
  healthFacility: patientId,
}: IProps) => {
  return <p className={className}>{patientId}</p>;
};
