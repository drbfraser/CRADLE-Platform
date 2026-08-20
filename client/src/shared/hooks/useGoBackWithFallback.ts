import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useGoBackWithFallback = () => {
  const navigate = useNavigate();

  const goBackWithFallback = useCallback(
    (fallbackPath: string) => {
      if (history.length > 2) {
        navigate(-1);
      } else {
        navigate(fallbackPath, { replace: true });
      }
    },
    [navigate]
  );

  return goBackWithFallback;
};
