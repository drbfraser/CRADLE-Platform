import { ManageFacilities } from './manageFacilities/ManageFacilities';
import { ManageFormTemplates } from './manageFormTemplates/ManageFormTemplates';
import { ManageRelayApp } from './manageRelayApp/ManageRelayApp';
import { ManageUsers } from './manageUsers/ManageUsers';
import { ManagePatients } from './managePatients/ManagePatients';
import { Route, Routes } from 'react-router-dom';
import { CustomFormTemplate } from './manageFormTemplates/editFormTemplate/CustomFormTemplate';
import { ViewWorkflowTemplate } from './manageWorkflowTemplates/ViewWorkflowTemplate';
import { CreateWorkflowTemplate } from './manageWorkflowTemplates/CreateWorkflowTemplate';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { ManageWorkflowTemplates } from './manageWorkflowTemplates/ManageWorkflowTemplates';
import {
  RoutedTabPanelData,
  RoutedTabs,
} from 'src/shared/components/Tabs/Tabs';

const panels: RoutedTabPanelData[] = [
  {
    label: 'Users',
    Component: ManageUsers,
    routeSegment: 'users',
  },
  {
    label: 'Health Care Facilities',
    Component: ManageFacilities,
    routeSegment: 'facilities',
  },
  {
    label: 'Form Templates',
    Component: ManageFormTemplates,
    routeSegment: 'form-templates',
  },
  {
    label: 'Relay App',
    Component: ManageRelayApp,
    routeSegment: 'relay',
  },
  {
    label: 'Patients',
    Component: ManagePatients,
    routeSegment: 'patients',
  },
  {
    label: 'Workflow',
    Component: ManageWorkflowTemplates,
    routeSegment: 'workflow-templates',
  },
];

export const AdminPage = () => {
  return (
    <Routes>
      <Route path={`form-templates/new`} element={<CustomFormTemplate />} />
      <Route
        path={`workflow-templates/new`}
        element={<CreateWorkflowTemplate />}
      />
      <Route
        path={`workflow-templates/view`}
        element={<ViewWorkflowTemplate />}
      />
      <Route path={':tab?'} element={<AdminDashboard />} />
    </Routes>
  );
};

const AdminDashboard = () => {
  return (
    <DashboardPaper>
      <RoutedTabs panels={panels} />
    </DashboardPaper>
  );
};
