import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export type ToastData = {
  severity: 'success' | 'error' | 'info' | 'warning';
  message: string;
};

const useToastAfterNav = () => {
  const toastData: ToastData | undefined = useLocation().state?.toast;

  const [open, setOpen] = useState<boolean>(toastData !== undefined);

  return { toastData: toastData ?? null, open, setOpen };
};

export default useToastAfterNav;
