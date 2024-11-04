import { ManageFacilities } from './manageFacilities/ManageFacilities';
import { ManageFormTemplates } from './manageFormTemplates/ManageFormTemplates';
import { ManageRelayApp } from './manageRelayApp/ManageRelayApp';
import { ManageUsers } from './manageUsers/ManageUsers';
import { ManagePatients } from './managePatients/ManagePatients';
import { Route, Routes } from 'react-router-dom';
import { CustomFormTemplate } from './manageFormTemplates/editFormTemplate/CustomFormTemplate';
import {
  useState,
  PropsWithChildren,
  useContext,
  createContext,
  useCallback,
} from 'react';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { Tabs } from 'src/shared/components/Tabs/Tabs';

const panels = [
  {
    label: 'Users',
    Component: ManageUsers,
  },
  {
    label: 'Health Care Facilities',
    Component: ManageFacilities,
  },
  {
    label: 'Form Templates',
    Component: ManageFormTemplates,
  },
  {
    label: 'Relay App',
    Component: ManageRelayApp,
  },
  {
    label: 'Patients',
    Component: ManagePatients,
  },
];

export const AdminPage = () => {
  return (
    <Routes>
      <Route path={`form-templates/new`} element={<CustomFormTemplate />} />
      <Route path="" element={<AdminDashboard />} />
    </Routes>
  );
};

const AdminDashboard = () => {
  return (
    <DashboardPaper>
      <Tabs panels={panels} />
    </DashboardPaper>
  );
};
