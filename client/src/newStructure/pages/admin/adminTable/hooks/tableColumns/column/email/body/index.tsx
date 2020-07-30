import React from 'react';
import { useStyles } from './styles';

interface IProps {
  className: string;
  email: string;
}

export const EmailBody: React.FC<IProps> = ({ className, email }: IProps) => {
  const classes = useStyles();
  return <p className={`${className} ${classes.text}`}>{email}</p>;
};
