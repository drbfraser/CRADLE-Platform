import React from 'react';

interface IProps {
  className: string;
  firstName: string;
}

export const FirstNameBody: React.FC<IProps> = ({ className, firstName }) => {
  return <p className={className}>{firstName}</p>;
};
