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
import { StatisticDashboard } from './utils/StatisticsInfo';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import {
  DIVIDER_SX,
  FORM_CTRL_SX,
  STATS_PAGE_SX,
} from './utils/statisticStyles';
import { Box } from '@mui/material';

interface IProps {
  from: number;
  to: number;
}

export const FacilityStatistics: React.FC<IProps> = ({ from, to }) => {
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
    <Box sx={STATS_PAGE_SX}>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <Box>
        <Typography variant="h5" gutterBottom sx={{ float: 'left' }}>
          Please select a facility from the list:
        </Typography>

        <FormControl variant="standard" sx={FORM_CTRL_SX}>
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
          <Box>
            <Divider sx={DIVIDER_SX} />
            <br />
            <StatisticDashboard
              getData={() => getFacilityStatisticsAsync(facility, from, to)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};
