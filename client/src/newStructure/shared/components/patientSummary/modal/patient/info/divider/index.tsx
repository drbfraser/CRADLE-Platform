import { Divider } from 'semantic-ui-react';

import React from 'react';

interface IProps {
  isEditPage: any
}

export const FormDivider: React.FC<IProps> = ({
  isEditPage,
}) => !isEditPage ? (
  <Divider />
) : null;
