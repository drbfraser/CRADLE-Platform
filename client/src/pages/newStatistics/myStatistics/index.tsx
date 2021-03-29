import { useEffect } from 'react';
import {
  getUserStatisticData,
  initialData,
  initialColorReading,
} from '../utils';
import React, { useState } from 'react';
import { StatisticDashboard } from '../utils/StatisticDashboard';
import { Toast } from 'src/shared/components/toast';

interface IProps {
  userId: number | undefined;
  from: Date;
  to: Date;
}

export const MyStatistics: React.FC<IProps> = ({ userId, from, to }) => {
  const [data, setData] = useState(initialData);
  const [errorLoading, setErrorLoading] = useState(false);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserStatisticData(userId, from.getTime() / 1000, to.getTime() / 1000)
      .then((response) => {
        setData(response);
        setColorReading(response);
        setLoading(true);
      })
      .catch((err) => {
        setErrorLoading(true);
      });
  }, [from, to]);

  return (
    <div>
      {errorLoading && (
        <Toast
          status="error"
          message="Something went wrong loading the health care facilities. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}
      <h3>During this period, you has assessed:</h3>
      <br />
      <br />

      {loading && (
        <StatisticDashboard data={data} colorReading={colorReading} />
      )}
    </div>
  );
};
