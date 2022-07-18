import React, { useState } from 'react';
import {
  getFacilityStatisticsAsync,
  getHealthFacilitiesAsync,
} from 'src/shared/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import { IFacility } from 'src/shared/types';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { StatisticDashboard } from './utils/StatisticDashboard';
import Typography from '@material-ui/core/Typography';
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

        <FormControl className={classes.formControl}>
          <Select value={facility} onChange={handleChange} labelWidth={20}>
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
