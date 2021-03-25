import { useEffect } from 'react';
import { getFacilitiesData } from '../utils';
import React, { useState } from 'react';
import { initialData, initialColorReading } from '../utils';
import { StatisticDashboard } from '../utils/StatisticDashboard';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { ActualUser, OrNull } from 'src/types';
import { Toast } from 'src/shared/components/toast';
import 'react-datepicker/dist/react-datepicker.css';

type User = {
  user: OrNull<ActualUser>;
};

export default function FacilitiesStatistics() {
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );

  const myFacilityName = user?.healthFacilityName;

  const [data, setData] = useState(initialData);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const [loading, setLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    getFacilitiesData(myFacilityName, 0, currentTimestamp)
      .then((response) => {
        setData(response);
        setColorReading(response);
        setLoading(true);
      })
      .catch((err) => {
        setErrorLoading(true);
      });
  }, []);

  return (
    <div>
      {errorLoading && (
        <Toast
          status="error"
          message="Something went wrong loading the health care facilities. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}
      <h1>During this period, your facility has assessed:</h1>
      {loading && (
        <StatisticDashboard data={data} colorReading={colorReading} />
      )}
    </div>
  );
}
