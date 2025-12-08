import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { Box, Divider, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';

import {
  getPatientRecordsAsync,
  getPatientReferralsAsync,
} from 'src/shared/api';
import { Filter, FilterRequestBody } from 'src/shared/types/filterTypes';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import ToastAfterNav from 'src/shared/components/toastAfterNav';
import { SexEnum } from 'src/shared/enums';
import { ConfirmDialog } from 'src/shared/components/confirmDialog';
import usePatient from 'src/shared/hooks/patient';
import {
  AssessmentCard,
  CustomizedFormCard,
  ReadingCard,
  ReferralAssessedCard,
  ReferralCancelledCard,
  ReferralNotAttendedCard,
  ReferralPendingCard,
} from './Cards';
import { Header } from './Header';
import { MedicalInfo } from './MedicalInfo';
import { PatientStats } from './PatientStats';
import { PersonalInfo } from './PersonalInfo';
import { PregnancyInfo } from './PregnancyInfo';
import { WorkflowInfo } from './WorkflowInfo/WorkflowInfo';

type RouteParams = {
  patientId: string;
};

type Record = {
  id: string | undefined;
  readingId?: string;
  isAssessed?: boolean;
  isCancelled?: boolean;
  notAttended?: boolean;
  date_taken?: number;
  date_referred?: number;
  date_assessed?: number;
  date_submitted?: number;
};

type OrganizedRecords = {
  readings: Record[];
  referrals: Record[];
  assessments: Record[];
  forms: Record[];
};

const filters: Filter[] = [
  {
    parameter: 'referrals',
    display_title: 'Referral',
  },
  {
    parameter: 'readings',
    display_title: 'Reading',
  },
  {
    parameter: 'assessments',
    display_title: 'Assessment',
  },
  {
    parameter: 'forms',
    display_title: 'Form',
  },
];

export const PatientPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams() as RouteParams;
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [filterRequestBody, setFilterRequestBody] = useState<FilterRequestBody>(
    {
      referrals: true,
      readings: true,
      assessments: true,
      forms: true,
    }
  );

  const { patient, errorLoading: errorLoadingPatientInfo } =
    usePatient(patientId);

  const { data: referrals, isError: errorLoadingReferrals } = useQuery({
    queryKey: ['referrals', patientId],
    queryFn: () => getPatientReferralsAsync(patientId),
  });

  const { data: organizedRecords, isError: errorLoadingRecords } = useQuery({
    queryKey: ['records', patientId, filterRequestBody],
    queryFn: (): Promise<OrganizedRecords> =>
      getPatientRecordsAsync(patientId, filterRequestBody),
  });

  // Flatten and merge all records with their type, then sort by timestamp
  const records = organizedRecords
    ? [
        ...organizedRecords.readings.map((r) => ({ ...r, type: 'reading' })),
        ...organizedRecords.referrals.map((r) => ({ ...r, type: 'referral' })),
        ...organizedRecords.assessments.map((r) => ({
          ...r,
          type: 'assessment',
        })),
        ...organizedRecords.forms.map((r) => ({ ...r, type: 'form' })),
      ].sort((a, b) => {
        // Sort by most recent timestamp
        const timeA =
          a.date_taken ||
          a.date_referred ||
          a.date_assessed ||
          a.date_submitted ||
          0;
        const timeB =
          b.date_taken ||
          b.date_referred ||
          b.date_assessed ||
          b.date_submitted ||
          0;
        return timeB - timeA;
      })
    : [];

  const hasPendingReferral =
    referrals?.some((r) => !r.isAssessed && !r.isCancelled && !r.notAttended) ??
    false;

  const errorLoading =
    errorLoadingPatientInfo || errorLoadingRecords || errorLoadingReferrals;
  return (
    <>
      {errorLoading && <APIErrorToast />}
      <ToastAfterNav />

      <ConfirmDialog
        title="Warning"
        content={
          'You have at least one pending referral. Do you still want to perform an assessment without assessing a referral?'
        }
        open={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
        }}
        onConfirm={() => {
          navigate(`/assessments/new/${patientId}`);
        }}
      />

      <Header
        patient={patient}
        isThereAPendingReferral={hasPendingReferral}
        setConfirmDialogPerformAssessmentOpen={setConfirmDialogOpen}
      />

      <WorkflowInfo />
      <Grid sx={{ marginTop: '1rem' }} container spacing={3}>
        <Grid container size={{ xs: 12, lg: 6 }} direction="column" spacing={2}>
          <PersonalInfo patient={patient} />

          {patient?.sex === SexEnum.FEMALE ? (
            <PregnancyInfo patientId={patientId} patientName={patient?.name} />
          ) : (
            <MedicalInfo patient={patient} patientId={patientId} />
          )}
        </Grid>

        <Grid container size={{ xs: 12, lg: 6 }} direction="column" spacing={2}>
          <PatientStats patientId={patientId} />

          {patient?.sex === SexEnum.FEMALE && (
            <MedicalInfo patient={patient} patientId={patientId} />
          )}
        </Grid>

        <Grid container size={{ xs: 12 }} spacing={2} direction="column">
          <Paper
            sx={(theme) => ({
              width: '100%',
              padding: theme.spacing(2),
              marginTop: theme.spacing(2),
            })}>
            <Grid
              sx={{
                display: 'flex',
                placeContent: 'end',
                alignItems: 'center',
              }}>
              <Typography component={'span'}>Show only: </Typography>
              {filters.map((filter) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterRequestBody[filter.parameter]}
                      onChange={(e) => {
                        setFilterRequestBody({
                          ...filterRequestBody,
                          [filter.parameter]: e.target.checked,
                        });
                      }}
                    />
                  }
                  label={filter.display_title}
                  key={filter.parameter}
                />
              ))}
            </Grid>

            <Divider />

            {records !== undefined && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {records.map((r: any) => (
                  <Grid key={r.id ?? r.readingId} size={{ xs: 12 }}>
                    {(() => {
                      switch (r.type) {
                        case 'assessment':
                          return <AssessmentCard assessment={r} />;
                        case 'form':
                          return <CustomizedFormCard form={r} />;
                        case 'reading':
                          return <ReadingCard reading={r} />;
                        case 'referral':
                          if (r.isAssessed) {
                            return <ReferralAssessedCard referral={r} />;
                          } else if (r.isCancelled) {
                            return <ReferralCancelledCard referral={r} />;
                          } else if (r.notAttended) {
                            return <ReferralNotAttendedCard referral={r} />;
                          } else {
                            return <ReferralPendingCard referral={r} />;
                          }
                        default:
                          return <div>error</div>;
                      }
                    })()}
                  </Grid>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};
