import React from 'react';
import { RoleEnum } from '../../../../../../../../enums';
import { getRoles } from '../../../../utils';
import { useStyles } from './styles';

interface IProps {
  className: string;
  roleIds: Array<number>;
}

export const RolesBody: React.FC<IProps> = ({ className, roleIds }: IProps) => {
  const classes = useStyles({ numberOfRoles: roleIds.length });

  return (
    <div className={className}>
      <p className={classes.roles}>
        {getRoles(roleIds).map(
          (role: RoleEnum): JSX.Element => (
            <span key={role}>{role}</span>
          )
        )}
      </p>
    </div>
  );
};
