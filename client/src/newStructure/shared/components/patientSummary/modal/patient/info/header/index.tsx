import { Header } from 'semantic-ui-react';

import React from 'react';

interface IProps {
  isEditPage: any
}

export const FormHeader: React.FC<IProps> = ({
  isEditPage,
}) => !isEditPage ? (
  <Header>
    <b>Patient Information</b>
  </Header>
) : null;
