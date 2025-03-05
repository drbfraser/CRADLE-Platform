import { useQuery } from '@tanstack/react-query';
import { Alert, Divider, Skeleton, Stack } from '@mui/material';

import { getPatientPregnancySummaryAsync } from 'src/shared/api/api';
import PregnancyStatsCurrent from './PregnancyStatsCurrent';
import PregnancyStatsPrevious from './PregnancyStatsPrevious';

type Props = {
  patientId: string;
};

const PregnancyStats = ({ patientId }: Props) => {
  const pregnancyHistoryQuery = useQuery({
    queryKey: ['pregnancyHistory', patientId],
    queryFn: () => getPatientPregnancySummaryAsync(patientId),
  });
  if (pregnancyHistoryQuery.isError) {
    return (
      <Alert severity="error">
        Something went wrong trying to load patient&rsquo;s pregnancy status.
        Please try refreshing.
      </Alert>
    );
  }
  if (pregnancyHistoryQuery.isPending) {
    return <Skeleton variant="rectangular" height={200} />;
  }

  return (
    <Stack gap={'1rem'}>
      <PregnancyStatsCurrent
        patientId={patientId}
        pregnancyInfo={pregnancyHistoryQuery.data}
      />

      <Divider />

      <PregnancyStatsPrevious
        patientId={patientId}
        pastPregnancies={pregnancyHistoryQuery.data.pastPregnancies}
      />
    </Stack>
  );
};

export default PregnancyStats;
