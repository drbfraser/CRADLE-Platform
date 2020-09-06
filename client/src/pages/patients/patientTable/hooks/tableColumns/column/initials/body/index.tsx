import React from 'react';
import { useStyles } from '../../../../../../../../shared/components/table/column/initials/styles';

interface IProps {
  className: string;
  initials: string;
}

export const InitialsBody: React.FC<IProps> = ({
  className,
  initials,
}: IProps) => {
  const classes = useStyles();
  return <p className={`${className} ${classes.text}`}>{initials}</p>;
};
