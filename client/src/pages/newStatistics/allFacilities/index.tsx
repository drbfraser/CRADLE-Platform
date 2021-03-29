import React, { useState } from 'react';
import { useEffect } from 'react';
import { IFacility } from 'src/types';
import { Toast } from 'src/shared/components/toast';
import { StatisticDashboard } from '../utils/StatisticDashboard';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import {
  getAllFacilities,
  getFacilitiesData,
  initialData,
  initialColorReading,
} from '../utils';

interface IProps {
  from: Date;
  to: Date;
}

export const AllFacilities: React.FC<IProps> = ({ from, to }) => {
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<IFacility[]>([]);
  const [facility, setFacility] = useState();
  const [data, setData] = useState(initialData);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const [errorLoading, setErrorLoading] = useState(false);

  const handleChange = (event: any) => {
    setFacility(event.target.value);
  };

  useEffect(() => {
    getAllFacilities()
      .then((response) => {
        setFacilities(response);
      })
      .catch((err) => {
        setErrorLoading(true);
      });
  }, []);

  useEffect(() => {
    if (facility !== undefined) {
      getFacilitiesData(facility, from.getTime() / 1000, to.getTime() / 1000)
        .then((response) => {
          setData(response);
          setColorReading(response);
          setLoading(true);
        })
        .catch((err) => {
          setErrorLoading(true);
        });
    }
  }, [facility, from, to]);

  return (
    <div>
      {errorLoading && (
        <Toast
          status="error"
          message="Something went wrong loading the all VHT information. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}
      <div>
        <h3>Please select a facility from the list:</h3>

        <Select value={facility} onChange={handleChange}>
          {facilities.map((f, idx) => (
            <MenuItem value={f.healthFacilityName} key={idx}>
              {`${f.healthFacilityName}`}
            </MenuItem>
          ))}
        </Select>
        <br />
        <br />

        {facility !== undefined && loading && (
          <StatisticDashboard data={data} colorReading={colorReading} />
        )}
      </div>
    </div>
  );
};
