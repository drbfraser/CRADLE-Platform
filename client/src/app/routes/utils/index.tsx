import { AdminPage } from '../../../pages/admin';
import { CovidCollectionPage } from '../../../pages/statistics/covidCollection';
import { LoginPage } from '../../../pages/login';
import { NotFoundPage } from '../../../pages/notFound';
import { PatientPage } from '../../../pages/patient';
import { PatientsPage } from '../../../pages/patients';
import React from 'react';
import { ReferralsPage } from '../../../pages/referrals';
import { ResourcesPage } from '../../../pages/resources';
import { RouteComponentProps } from 'react-router-dom';
import SchoolIcon from '@material-ui/icons/School';
import SendIcon from '@material-ui/icons/Send';
import SettingsIcon from '@material-ui/icons/Settings';
import { StatisticsPage } from '../../../pages/statistics';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { VideoChatPage } from '../../../pages/videoChat';
import { VideoSessionPage } from '../../../pages/videoSession';
import VideocamIcon from '@material-ui/icons/Videocam';
import { makeUniqueId } from '../../../shared/utils';
import { NewReading } from '../../../pages/newReading';
import { NewPatientPage } from '../../../pages/newPatient';

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
    component: NewPatientPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/patients/new`,
  },
  {
    component: NewReading,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/readings/new`,
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
    component: VideoChatPage,
    exactPath: true,
    id: makeUniqueId(),
    icon: <VideocamIcon fontSize="large" />,
    inNavigation: true,
    name: `Chat`,
    private: true,
    title: `Live Video Chat`,
    to: `/chat`,
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
    component: StatisticsPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/stats`,
  },
  {
    component: CovidCollectionPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/covid/collection`,
  },
  {
    component: VideoSessionPage,
    exactPath: true,
    id: makeUniqueId(),
    inNavigation: false,
    private: true,
    to: `/chat/:roomId`,
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
    // * Special match for analytics
    if (route.to === `/covid/collection` || route.to === `/stats`) {
      routes[route.to] = `Analytics`;
    } else {
      routes[route.to ?? ``] = route.name ?? ``;
    }
    return routes;
  },
  {}
);
