import { useEffect } from 'react';
import { getStatisticData } from '../utils';
import React, { useState } from 'react';
import { initialData, initialColorReading } from '../utils';
import { StatisticDashboard } from '../utils/StatisticDashboard';
import { Toast } from 'src/shared/components/toast';

interface IProps {
  from: Date;
  to: Date;
}

export const MyStatistics: React.FC<IProps> = ({ from, to }) => {
  const [data, setData] = useState(initialData);
  const [errorLoading, setErrorLoading] = useState(false);
  const [colorReading, setColorReading] = useState(initialColorReading);
  // const currentTimestamp = Math.floor(Date.now() / 1000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStatisticData(from.getTime() / 1000, to.getTime() / 1000)
      .then((response) => {
        setData(response);
        setColorReading(response);
        setLoading(true);
        console.log(data);
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
      <h1>During this period, you has assessed:</h1>
      {loading && (
        <StatisticDashboard data={data} colorReading={colorReading} />
      )}
    </div>
  );
};
