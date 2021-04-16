import { AdminPage } from 'src/pages/admin';
import { LoginPage } from 'src/pages/login';
import { NotFoundPage } from 'src/pages/notFound';
import { PatientPage } from 'src/pages/patient';
import { PatientsPage } from 'src/pages/patients';
import React from 'react';
import { ReferralsPage } from 'src/pages/referrals';
import { ResourcesPage } from 'src/pages/resources';
import { RouteComponentProps } from 'react-router-dom';
import SchoolIcon from '@material-ui/icons/School';
import SendIcon from '@material-ui/icons/Send';
import SettingsIcon from '@material-ui/icons/Settings';
import Statistics from 'src/pages/statistics';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { makeUniqueId } from 'src/shared/utils';
import { AssessmentFormPage } from 'src/pages/assessmentForm';
import { PatientFormPage } from 'src/pages/patientForm';
import { ReadingFormPage } from 'src/pages/readingForm';
import PollIcon from '@material-ui/icons/Poll';
import { ReferralFormPage } from 'src/pages/referralForm';

export type AppRoute = {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  exactPath: boolean;
  id: string;
  inNavigation: boolean;
  private: boolean;
  icon?: React.ReactNode;
  name?: string;
  title?: string;
  to?: string;
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
    to: `/patients/edit/:patientId`,
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
    component: AssessmentFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/assessments/new/:readingId`,
  },
  {
    component: AssessmentFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/assessments/edit/:readingId/:assessmentId`,
  },
  {
    component: ReferralFormPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/referrals/new/:readingId`,
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
    component: Statistics,
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
    exactPath: true,
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
    to: `/patients/:id`,
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
  },
];

type RoutesNames = Record<string, string>;

export const routesNames: RoutesNames = appRoutes.reduce(
  (routes: RoutesNames, route: AppRoute): RoutesNames => {
    routes[route.to ?? ``] = route.name ?? ``;
    return routes;
  },
  {}
);
