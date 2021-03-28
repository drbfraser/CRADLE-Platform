import React from 'react';
import { Tab } from 'semantic-ui-react';
import { ManageUsers } from './manageUsers/ManageUsers';
import { ManageFacilities } from './manageFacilities/ManageFacilities';

const pages = [
  {
    name: 'Users',
    Component: ManageUsers,
  },
  {
    name: 'Health Care Facilities',
    Component: ManageFacilities,
  },
];

const panes = pages.map((p) => ({
  menuItem: p.name,
  render: () => (
    <Tab.Pane style={{ padding: 0 }}>
      <p.Component />
    </Tab.Pane>
  ),
}));

export const AdminPage = () => <Tab panes={panes} />;
