import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export type Toast = {
  severity: 'success' | 'error' | 'info' | 'warning';
  message: string;
};

const useToastAfterNav = () => {
  const toastData: Toast | undefined = useLocation().state?.toast;

  const [open, setOpen] = useState<boolean>(toastData !== undefined);

  return { toast: toastData ?? null, open, setOpen };
};

export default useToastAfterNav;
