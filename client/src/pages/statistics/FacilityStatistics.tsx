import { useState } from 'react';
import {
  getFacilityStatisticsAsync,
  getHealthFacilitiesAsync,
} from 'src/shared/api/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import { Facility } from 'src/shared/types';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { StatisticDashboard } from './utils/StatisticsInfo';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { DIVIDER_SX, STATS_PAGE_SX } from './utils/statisticStyles';
import { Box } from '@mui/material';

type FacilityStatisticsProps = {
  from: number;
  to: number;
};

export const FacilityStatistics = ({ from, to }: FacilityStatisticsProps) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
          <Typography variant="h5" gutterBottom sx={{ margin: '0' }}>
            Please select a facility from the list:
          </Typography>
          <FormControl
            variant="standard"
            sx={{
              width: '100px',
            }}>
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
        </Box>
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
