import React from 'react';
import { User } from '@types';

interface IProps {
  className: string;
  data: Array<User>;
  label?: string;
}

export const TakeActionHead: React.FC<IProps> = ({ className, label }) => {
  return <th className={className}>{label}</th>;
};
