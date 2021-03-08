import React from 'react';

interface IProps {
  className: string;
  email: string;
}

export const EmailBody: React.FC<IProps> = ({ className, email }: IProps) => {
  return <p className={className}>{email}</p>;
};
