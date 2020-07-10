import { MaterialUIContextProvider } from './materialUI';
import React from 'react';

export const ContextProvider: React.FC = ({ children }) => {
  return <MaterialUIContextProvider>{children}</MaterialUIContextProvider>;
};
