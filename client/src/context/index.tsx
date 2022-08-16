import { MaterialUIContextProvider } from './materialUI';

interface IProps {
  children: React.ReactNode;
}

export const ContextProvider: React.FC<IProps> = ({ children }) => (
  <MaterialUIContextProvider>{children}</MaterialUIContextProvider>
);
