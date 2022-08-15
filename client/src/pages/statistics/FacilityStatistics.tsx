import React, { useState } from 'react';
import {
  getFacilityStatisticsAsync,
  getHealthFacilitiesAsync,
} from 'src/shared/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import { IFacility } from 'src/shared/types';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { StatisticDashboard } from './utils/StatisticDashboard';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useStatisticsStyles } from './utils/statisticStyles';

interface IProps {
  from: number;
  to: number;
}

export const FacilityStatistics: React.FC<IProps> = ({ from, to }) => {
  const classes = useStatisticsStyles();
  const [facilities, setFacilities] = useState<IFacility[]>([]);
  const [facility, setFacility] = useState('');
  const [errorLoading, setErrorLoading] = useState(false);

  const handleChange = (event: any) => {
    setFacility(event.target.value);
  };

  useEffect(() => {
    const getAllFacilities = async () => {
      try {
        setFacilities(await getHealthFacilitiesAsync());
      } catch (e) {
        setErrorLoading(true);
      }
    };
    getAllFacilities();
  }, []);

  return (
    <div>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <div>
        <Typography variant="h5" gutterBottom className={classes.floatLeft}>
          Please select a facility from the list:
        </Typography>

        <FormControl variant="standard" className={classes.formControl}>
          <Select
            variant="standard"
            value={facility}
            onChange={handleChange}
            autoWidth>
            {facilities.map((f, idx) => (
              <MenuItem value={f.healthFacilityName} key={idx}>
                {`${f.healthFacilityName}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <br />
        {facility !== '' && (
          <div>
            <Divider className={classes.divider} />
            <br />
            <StatisticDashboard
              getData={() => getFacilityStatisticsAsync(facility, from, to)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
