import { HealthFacility, OrNull } from 'src/types';
import { useDispatch, useSelector } from 'react-redux';

import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { getHealthFacilityList } from 'src/redux/reducers/healthFacilities';

export const useHealthFacilities = () => {
  const healthFacilities = useSelector(
    ({ healthFacilities }: ReduxState): OrNull<Array<HealthFacility>> =>
      healthFacilities.data
  );

  const dispatch = useDispatch();

  React.useEffect((): void => {
    if (!healthFacilities) {
      dispatch(getHealthFacilityList());
    }
  }, [dispatch, healthFacilities]);

  return healthFacilities ?? [];
};
