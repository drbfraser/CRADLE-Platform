import React from 'react';

interface IProps {
  className: string;
  villageNumber: string;
}

export const VillageBody: React.FC<IProps> = ({
  className,
  villageNumber,
}: IProps) => {
  return <p className={className}>{villageNumber}</p>;
};
