import { useState } from 'react';
import { Location, useLocation } from 'react-router-dom';

export type Toast = {
  severity: 'success' | 'error' | 'info' | 'warning';
  message: string;
};

const useToast = () => {
  const location: Location<{
    toast: Toast | undefined;
  }> = useLocation();
  const [open, setOpen] = useState<boolean>(
    location.state?.toast !== undefined
  );

  return { toast: location.state?.toast ?? null, open, setOpen };
};

export default useToast;
