import { useState } from 'react';
import { getFacilityStatisticsAsync } from 'src/shared/api/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { StatisticDashboard } from './utils/StatisticsInfo';
import Typography from '@mui/material/Typography';
import { DIVIDER_SX, STATS_PAGE_SX } from './utils/statisticStyles';
import { Box } from '@mui/material';
import { useHealthFacilitiesQuery } from 'src/shared/queries';

type FacilityStatisticsProps = {
  from: number;
  to: number;
};

export const FacilityStatistics = ({ from, to }: FacilityStatisticsProps) => {
  const [facility, setFacility] = useState('');

  const { data, isError } = useHealthFacilitiesQuery();
  const facilities = data ?? [];

  const handleChange = (event: SelectChangeEvent) => {
    setFacility(event.target.value);
  };

  return (
    <Box sx={STATS_PAGE_SX}>
      {isError && <APIErrorToast />}

      <Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
          <Typography
            variant={'h5'}
            component={'h5'}
            gutterBottom
            sx={{ margin: '0' }}>
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
              {facilities.map((facility, idx) => (
                <MenuItem value={facility.name} key={idx}>
                  {`${facility.name}`}
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
