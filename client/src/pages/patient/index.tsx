import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Grid from '@mui/material/Grid2';

import {
  getPatientRecordsAsync,
  getPatientReferralsAsync,
} from 'src/shared/api';
import { FilterRequestBody } from 'src/shared/types/filterTypes';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import ToastAfterNav from 'src/shared/components/toastAfterNav';
import { SexEnum } from 'src/shared/enums';
import { ConfirmDialog } from 'src/shared/components/confirmDialog';
import usePatient from 'src/shared/hooks/patient';
import { Header } from './Header';
import { MedicalInfo } from './MedicalInfo';
import { PatientStats } from './PatientStats';
import { PersonalInfo } from './PersonalInfo';
import { PregnancyInfo } from './PregnancyInfo';
import { WorkflowInfo } from './WorkflowInfo/WorkflowInfo';
import { OrganizedRecords } from 'src/shared/types/types';
import { flattenAndSortRecords } from './utils/flattenAndSortRecords';
import { PatientRecordTimeline } from './components/PatientRecordTimeline';

type RouteParams = {
  patientId: string;
};

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

  const records = organizedRecords
    ? flattenAndSortRecords(organizedRecords)
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
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={() => navigate(`/assessments/new/${patientId}`)}
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
          <PatientRecordTimeline
            records={records}
            filterRequestBody={filterRequestBody}
            onFilterChange={setFilterRequestBody}
          />
        </Grid>
      </Grid>
    </>
  );
};
