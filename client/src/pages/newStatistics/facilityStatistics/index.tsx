import { useEffect } from 'react';
import { getFacilitiesData } from '../utils';
import React, { useState } from 'react';
import { initialData, initialColorReading } from '../utils';
import { StatisticDashboard } from '../utils/StatisticDashboard';
import { Toast } from 'src/shared/components/toast';
import 'react-datepicker/dist/react-datepicker.css';

interface IProps {
  facilityName: string | undefined;
  from: Date;
  to: Date;
}

export const FacilityStatistics: React.FC<IProps> = ({
  facilityName,
  from,
  to,
}) => {
  const [data, setData] = useState(initialData);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const [loading, setLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    getFacilitiesData(facilityName, from.getTime() / 1000, to.getTime() / 1000)
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
      <h1>During this period, your facility has assessed:</h1>
      {loading && (
        <StatisticDashboard data={data} colorReading={colorReading} />
      )}
    </div>
  );
};
