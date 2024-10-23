import { ManageFacilities } from './manageFacilities/ManageFacilities';
import { ManageFormTemplates } from './manageFormTemplates/ManageFormTemplates';
import { ManageRelayApp } from './manageRelayApp/ManageRelayApp';
import { ManageUsers } from './manageUsers/ManageUsers';
import { ManagePatients } from './managePatients/ManagePatients';
import { Tab } from 'semantic-ui-react';
import { theme } from 'src/context/providers/materialUI/theme';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { CustomFormTemplate } from './manageFormTemplates/editFormTemplate/CustomFormTemplate';

const pages = [
  {
    name: 'Users',
    Component: ManageUsers,
    route: '/admin/users',
  },
  {
    name: 'Health Care Facilities',
    Component: ManageFacilities,
    route: '/admin/facilities',
  },
  {
    name: 'Form Templates',
    Component: ManageFormTemplates,
    route: '/admin/form-templates',
  },
  {
    name: 'Relay App',
    Component: ManageRelayApp,
    route: '/admin/app',
  },
  {
    name: 'Patients',
    Component: ManagePatients,
    route: '/admin/patients',
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

export const AdminPage = () => {
  const navigate = useNavigate();

  const activePageIndex = pages.findIndex(
    (page) => page.route === window.location.pathname
  );
  const activeIndex = activePageIndex === -1 ? 0 : activePageIndex;

  return (
    <Routes>
      <Route path={`form-templates/new`}>
        <CustomFormTemplate />
      </Route>
      <Route>
        <Tab
          menu={{
            secondary: true,
            pointing: true,
            className: {
              display: `fluid`,
              flexDirection: `row`,
              flexWrap: `wrap`,
            },
          }}
          onTabChange={(e, data) => {
            if (data && data.panes && data.activeIndex !== undefined) {
              const index: number =
                typeof data.activeIndex === 'string'
                  ? parseInt(data.activeIndex)
                  : data.activeIndex;
              navigate(`${pages[index].route}`);
            }
          }}
          activeIndex={activeIndex}
          panes={panes}
        />
      </Route>
    </Routes>
  );
};
