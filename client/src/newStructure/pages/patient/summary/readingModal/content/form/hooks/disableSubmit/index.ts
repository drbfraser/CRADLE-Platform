import { NewReading } from '@types';
import React from 'react';

interface IArgs {
  hasUrineTest: boolean;
  loading: boolean;
  newReading: NewReading;
}

export const useDisableSubmit = ({
  hasUrineTest,
  loading,
  newReading,
}: IArgs): boolean => {
  return React.useMemo((): boolean => {
    return (
      !newReading.bpSystolic ||
      !newReading.bpDiastolic ||
      !newReading.heartRateBPM ||
      loading ||
      (hasUrineTest &&
        (!newReading.urineTests.urineTestBlood ||
          !newReading.urineTests.urineTestGlu ||
          !newReading.urineTests.urineTestLeuc ||
          !newReading.urineTests.urineTestNit ||
          !newReading.urineTests.urineTestPro))
    );
  }, [hasUrineTest, loading, newReading]);
};
