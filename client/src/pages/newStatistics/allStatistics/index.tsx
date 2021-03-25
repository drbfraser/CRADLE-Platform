import { useEffect } from 'react';
import { getAllUserAndFacilitiesData } from '../utils';
import React, { useState } from 'react';
import { initialData, initialColorReading } from '../utils';
import { StatisticDashboard } from '../utils/StatisticDashboard';
import { Toast } from 'src/shared/components/toast';

interface IProps {
  isAdmin: boolean;
}

export const AllStatistics: React.FC<IProps> = ({ isAdmin }) => {
  const [data, setData] = useState(initialData);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const [loading, setLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    console.log(isAdmin);
    getAllUserAndFacilitiesData(0, currentTimestamp)
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
      <h1>During this period, all user and facilities have assessed:</h1>
      {loading && (
        <StatisticDashboard data={data} colorReading={colorReading} />
      )}
    </div>
  );
};
