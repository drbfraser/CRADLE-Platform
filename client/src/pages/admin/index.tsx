import React from 'react';
import { Tab } from 'semantic-ui-react';
import { ManageUsers } from './manageUsers/ManageUsers';
import { ManageFacilities } from './manageFacilities/ManageFacilities';
import { ManageFiles } from './manageFiles/ManageFiles';

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
    name: 'Files',
    Component: ManageFiles,
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
