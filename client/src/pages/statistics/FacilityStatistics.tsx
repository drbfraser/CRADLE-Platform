import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Divider,
  FormControl,
  MenuItem,
  Typography,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { getFacilityStatisticsAsync } from 'src/shared/api/apiStatistics';

import { useHealthFacilitiesQuery } from 'src/shared/queries';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { StatisticDashboard } from './utils/StatisticsDashboard';
import { DIVIDER_SX, STATS_PAGE_SX } from './utils/statisticStyles';

type FacilityStatisticsProps = {
  from: number;
  to: number;
};

export const FacilityStatistics = ({ from, to }: FacilityStatisticsProps) => {
  const [facilityName, setFacilityName] = useState('');
  const handleChange = (event: SelectChangeEvent) => {
    setFacilityName(event.target.value);
  };

  const allFacilitiesQuery = useHealthFacilitiesQuery();

  const facilityQuery = useQuery({
    queryKey: ['facility', facilityName, from, to],
    queryFn: () => getFacilityStatisticsAsync(facilityName, from, to),
    enabled: !!facilityName,
  });

  return (
    <Box sx={STATS_PAGE_SX}>
      {allFacilitiesQuery.isError && <APIErrorToast />}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
        <Typography
          variant="h5"
          component="h5"
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
            value={facilityName}
            onChange={handleChange}
            autoWidth>
            {allFacilitiesQuery.data?.map((facility, idx) => (
              <MenuItem value={facility.name} key={idx}>
                {facility.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {facilityName !== '' && (
        <>
          <Divider sx={{ ...DIVIDER_SX, marginY: '2rem' }} />
          <StatisticDashboard statsQuery={facilityQuery} />
        </>
      )}
    </Box>
  );
};
