import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export type ToastData = {
  severity: 'success' | 'error' | 'info' | 'warning';
  message: string;
};

const useToastAfterNav = (): {
  toastData: ToastData | null;
  isToastOpen: boolean;
  setToastOpen: (val: boolean) => void;
} => {
  const toastData: ToastData | null = useLocation().state?.toastData ?? null;
  const [isToastOpen, setToastOpen] = useState<boolean>(toastData !== null);

  return { toastData, isToastOpen, setToastOpen };
};

export default useToastAfterNav;
