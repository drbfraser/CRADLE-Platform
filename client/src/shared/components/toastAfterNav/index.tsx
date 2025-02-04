import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Toast } from '../toast';

export type ToastData = {
  severity: 'success' | 'error' | 'info' | 'warning';
  message: string;
};

const ToastAfterNav = () => {
  const toastData: ToastData | null = useLocation().state?.toastData ?? null;
  const [isToastOpen, setToastOpen] = useState<boolean>(toastData !== null);

  return (
    <>
      {toastData && (
        <Toast
          open={isToastOpen}
          severity={toastData.severity}
          message={toastData.message}
          autoHideDuration={null}
          onClose={() => setToastOpen(false)}
        />
      )}
    </>
  );
};

export default ToastAfterNav;
