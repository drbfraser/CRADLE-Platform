import { ManageFacilities } from './manageFacilities/ManageFacilities';
import { ManageFormTemplates } from './manageForms/ManageForms';
import { ManageRelayApp } from './manageRelayApp/ManageRelayApp';
import { ManageUsers } from './manageUsers/ManageUsers';
import React from 'react';
import { Tab } from 'semantic-ui-react';
import { theme } from 'src/context/materialUI/theme';

const pages = [
  {
    name: 'Users',
    Component: ManageUsers,
  },
  {
    name: 'Health Care Facilities',
    Component: ManageFacilities,
  },
  {
    name: 'Form Templates',
    Component: ManageFormTemplates,
  },
  {
    name: 'Relay App',
    Component: ManageRelayApp,
  },
];

const panes = pages.map((p) => ({
  menuItem: p.name,
  render: () => (
    <Tab.Pane style={{ padding: theme.spacing(2) }}>
      <p.Component />
    </Tab.Pane>
  ),
}));

export const AdminPage = () => (
  <Tab
    menu={{
      secondary: true,
      pointing: true,
      className: { display: `fluid`, flexDirection: `row`, flexWrap: `wrap` },
    }}
    panes={panes}
  />
);
