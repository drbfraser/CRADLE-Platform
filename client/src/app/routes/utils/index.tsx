import { AdminPage } from 'src/pages/admin';
import { AssessmentFormPage } from 'src/pages/assessmentForm';
import { CustomizedEditFormPage } from 'src/pages/customizedForm/customizedEditForm';
import { CustomizedFormPage } from 'src/pages/customizedForm';
import { CustomizedViewFormPage } from 'src/pages/customizedForm/customizedViewForm';
import { HistoryTablesPage } from 'src/pages/historyTables';
import { LoginPage } from 'src/pages/login';
import { NotFoundPage } from 'src/pages/notFound';
import { PatientFormPage } from 'src/pages/patientForm';
import { PatientPage } from 'src/pages/patient';
import { PatientsPage } from 'src/pages/patients';
import PollIcon from '@mui/icons-material/Poll';
import { ReadingFormPage } from 'src/pages/readingForm';
import { ReferralFormPage } from 'src/pages/referralForm';
import { ReferralsPage } from 'src/pages/referrals';
import { ResourcesPage } from 'src/pages/resources';
import SchoolIcon from '@mui/icons-material/School';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import { SingleReasonFormPage } from 'src/pages/singleReasonForm';
import { StatisticsPage } from 'src/pages/statistics';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { makeUniqueId } from 'src/shared/utils';

export type AppRoute = {
  component: React.ComponentType<any>;
  exactPath: boolean;
  id: string;
  inNavigation: boolean;
  private: boolean;
  icon?: React.ReactNode;
  name?: string;
  title?: string;
  to: string;
};

// * Order here is important must match order of side bar for relevant routes
export const appRoutes: Array<AppRoute> = [
  {
    component: PatientFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/patients/new`,
  },
  {
    component: PatientFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/patients/:patientId/edit/:editId`,
  },
  {
    component: PatientFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/patients/:patientId/edit/:editId/:universalRecordId`,
  },
  {
    component: PatientFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/pregnancies/new/:patientId`,
  },
  {
    component: CustomizedFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/forms/new/:patientId`,
  },
  {
    component: CustomizedEditFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/forms/edit/:patientId/:formId`,
  },
  {
    component: CustomizedViewFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/forms/view/:patientId/:formId`,
  },
  {
    component: ReadingFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/readings/new/:patientId`,
  },
  // the following 3 AssessmentFormPage is for 3 different cases
  {
    component: AssessmentFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/assessments/new/:patientId`,
  },
  {
    component: AssessmentFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/assessments/edit/:patientId/:assessmentId`,
  },
  {
    component: AssessmentFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/assessments/new/:patientId/:referralId`,
  },
  {
    component: ReferralFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/referrals/new/:patientId`,
  },
  {
    component: ReferralsPage,
    exactPath: true,
    id: makeUniqueId(),
    icon: <SendIcon fontSize="large" />,
    inNavigation: true,
    name: `Referrals`,
    private: true,
    title: `Referrals`,
    to: `/referrals`,
  },
  {
    component: SingleReasonFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/referrals/cancel-status-switch/:referralId/:type`,
  },
  {
    component: SingleReasonFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/referrals/not-attend/:referralId/:type`,
  },
  {
    component: PatientsPage,
    exactPath: true,
    id: makeUniqueId(),
    icon: <SupervisorAccountIcon fontSize="large" />,
    inNavigation: true,
    name: `Patients`,
    private: true,
    title: `Patients`,
    to: `/patients`,
  },
  {
    component: StatisticsPage,
    exactPath: true,
    id: makeUniqueId(),
    icon: <PollIcon fontSize="large" />,
    inNavigation: true,
    name: `Statistics`,
    private: true,
    title: `Statistics`,
    to: `/stats`,
  },
  {
    component: ResourcesPage,
    exactPath: true,
    id: makeUniqueId(),
    icon: <SchoolIcon fontSize="large" />,
    inNavigation: true,
    name: `Resources`,
    private: true,
    title: `Resources`,
    to: `/resources`,
  },
  {
    component: AdminPage,
    exactPath: false,
    id: makeUniqueId(),
    icon: <SettingsIcon fontSize="large" />,
    inNavigation: true,
    name: `Admin`,
    private: true,
    title: `Admin`,
    to: `/admin`,
  },
  {
    component: PatientPage,
    exactPath: false,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/patients/:patientId`,
  },
  {
    component: HistoryTablesPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    name: `History`,
    title: `History`,
    private: true,
    to: `/history/:patientId/:patientName/:patientSex`,
  },
  {
    component: LoginPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: false,
    to: `/`,
  },
  {
    component: LoginPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: false,
    to: `/login`,
  },
  {
    component: NotFoundPage,
    exactPath: false,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/not-found`,
  },
];

type RoutesNames = Record<string, string>;

export const routesNames: RoutesNames = appRoutes.reduce(
  (routes: RoutesNames, route: AppRoute): RoutesNames => {
    routes[route.to] = route.name ?? '';
    return routes;
  },
  {}
);
