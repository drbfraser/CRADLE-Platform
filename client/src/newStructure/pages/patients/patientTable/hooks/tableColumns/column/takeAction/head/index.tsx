import React from 'react';

interface IProps {
  className: string;
  label?: string;
}

export const TakeActionHead: React.FC<IProps> = ({ className, label }) => {
  return <th className={className}>{label}</th>;
};
