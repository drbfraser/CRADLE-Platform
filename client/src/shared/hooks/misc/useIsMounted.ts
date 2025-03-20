import { useEffect, useState } from 'react';

export default function useIsMounted() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, [setIsMounted]);

  return isMounted;
}
