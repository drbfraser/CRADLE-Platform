import React from 'react';
import { RoleEnum } from '../../../../../../../../enums';

interface IProps {
  className: string;
  roles: Array<RoleEnum>;
}

export const RolesBody: React.FC<IProps> = ({ className, roles }: IProps) => {
  return <p className={className}>{roles}</p>;
};
