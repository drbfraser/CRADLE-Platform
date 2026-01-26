import { AdminPage } from 'src/pages/admin';
import { AssessmentFormPage } from 'src/pages/assessmentForm';
import { HistoryTablesPage } from 'src/pages/historyTables';
import { LoginPage } from 'src/pages/login';
import { NotFoundPage } from 'src/pages/notFound';
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
import { makeUniqueId } from 'src/shared/utils';
import SecretKeyPage from 'src/pages/secretKey';
import PatientRoutes from './PatientRoutes';
import CustomFormRoutes from './CustomFormRoutes';
import { NewWorkflowInstancePage } from 'src/pages/newWorkflowInstance';
import WorkflowInstanceDetailsPage from 'src/pages/patient/WorkflowInfo/WorkflowInstanceDetails';

export type AppRoute = {
  component: React.ComponentType<any>;
  exactPath: boolean;
  id: string;
  inNavigation: boolean;
  private: boolean;
  to: string;
  title?: string;
  name?: string;
  icon?: React.ReactNode;
};

// * Order here is important must match order of side bar for relevant routes
export const appRoutes: Array<AppRoute> = [
  {
    component: PatientRoutes,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/patients/*`,
  },
  {
    component: CustomFormRoutes,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/forms/*`,
  },
  {
    component: ReadingFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/readings/new/:patientId`,
  },
  {
    component: NewWorkflowInstancePage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/workflow-instance/new/:patientId`,
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
    to: `/referrals/cancel-status-switch/:referralId/:cancellationType`,
  },
  {
    component: SingleReasonFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/referrals/not-attend/:referralId/:cancellationType`,
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
    to: `/admin/*`,
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
    component: SecretKeyPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    name: 'SecretKey',
    title: 'SecretKey',
    private: true,
    to: '/secretkey',
  },
  {
    component: WorkflowInstanceDetailsPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    name: 'WorkflowInstanceDetails',
    title: 'Workflow Instance Details',
    private: true,
    to: '/workflow-instance/view/:instanceId',
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
    to: `*`,
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
