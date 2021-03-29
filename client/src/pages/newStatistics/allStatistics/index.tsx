import { useEffect } from 'react';
import { getAllUserAndFacilitiesData } from '../utils';
import React, { useState } from 'react';
import { initialData, initialColorReading } from '../utils';
import { StatisticDashboard } from '../utils/StatisticDashboard';
import { Toast } from 'src/shared/components/toast';

interface IProps {
  from: Date;
  to: Date;
}

export const AllStatistics: React.FC<IProps> = ({ from, to }) => {
  const [data, setData] = useState(initialData);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const [loading, setLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    getAllUserAndFacilitiesData(from.getTime() / 1000, to.getTime() / 1000)
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
      <h3>During this period, all user and facilities have assessed:</h3>
      <br />
      <br />
      {loading && (
        <StatisticDashboard data={data} colorReading={colorReading} />
      )}
    </div>
  );
};
