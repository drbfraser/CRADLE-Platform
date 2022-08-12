import { HealthFacility, OrNull } from 'src/shared/types';

import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { getHealthFacilityList } from 'src/redux/reducers/healthFacilities';
import { useAppDispatch } from 'src/app/context/hooks';
import { useSelector } from 'react-redux';

export const useHealthFacilities = () => {
  const healthFacilities = useSelector(
    ({ healthFacilities }: ReduxState): OrNull<Array<HealthFacility>> =>
      healthFacilities.data
  );

  const dispatch = useAppDispatch();

  React.useEffect((): void => {
    if (!healthFacilities) {
      dispatch(getHealthFacilityList());
    }
  }, [dispatch, healthFacilities]);

  return healthFacilities ?? [];
};
