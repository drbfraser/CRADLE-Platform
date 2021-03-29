import React, { useState } from 'react';
import { useEffect } from 'react';
import { IVHT } from 'src/types';
import { Toast } from 'src/shared/components/toast';
import { StatisticDashboard } from '../utils/StatisticDashboard';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import {
  getAllVHT,
  getUserStatisticData,
  initialData,
  initialColorReading,
} from '../utils';

interface IProps {
  from: Date;
  to: Date;
}

export const AllVHTs: React.FC<IProps> = ({ from, to }) => {
  const [loading, setLoading] = useState(false);
  const [vhts, setVhts] = useState<IVHT[]>([]);
  const [vht, setVht] = useState();
  const [data, setData] = useState(initialData);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const [errorLoading, setErrorLoading] = useState(false);

  const handleChange = (event: any) => {
    setVht(event.target.value);
  };

  useEffect(() => {
    getAllVHT()
      .then((response) => {
        setVhts(response);
      })
      .catch((err) => {
        setErrorLoading(true);
      });
  }, []);

  useEffect(() => {
    if (vht !== undefined) {
      getUserStatisticData(vht, from.getTime() / 1000, to.getTime() / 1000)
        .then((response) => {
          setData(response);
          setColorReading(response);
          setLoading(true);
        })
        .catch((err) => {
          setErrorLoading(true);
        });
    }
  }, [vht, from, to]);

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
        <h3>Please select a vht from the list:</h3>

        <Select value={vht} onChange={handleChange}>
          {vhts.map((vht, idx) => (
            <MenuItem value={vht.userId} key={idx}>
              {`${vht.firstName} (id: ${vht.userId})`}
            </MenuItem>
          ))}
        </Select>
        <br />
        <br />

        {vht !== undefined && loading && (
          <StatisticDashboard data={data} colorReading={colorReading} />
        )}
      </div>
    </div>
  );
};
