import { ManageFacilities } from './manageFacilities/ManageFacilities';
import { ManageFormTemplates } from './manageFormTemplates/ManageFormTemplates';
import { ManageRelayApp } from './manageRelayApp/ManageRelayApp';
import { ManageUsers } from './manageUsers/ManageUsers';
import { ManagePatients } from './managePatients/ManagePatients';
import { Route, Routes } from 'react-router-dom';
import { CustomFormTemplate } from './manageFormTemplates/editFormTemplate/CustomFormTemplate';
import { Tabs, Tab } from '@mui/material';
import {
  useState,
  PropsWithChildren,
  useContext,
  createContext,
  useCallback,
} from 'react';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';

const pages = [
  {
    name: 'Users',
    Component: ManageUsers,
    path: 'users',
  },
  {
    name: 'Health Care Facilities',
    Component: ManageFacilities,
    path: 'facilities',
  },
  {
    name: 'Form Templates',
    Component: ManageFormTemplates,
    path: 'form-templates',
  },
  {
    name: 'Relay App',
    Component: ManageRelayApp,
    path: 'app',
  },
  {
    name: 'Patients',
    Component: ManagePatients,
    path: 'patients',
  },
];

export const AdminPage = () => {
  return (
    <Routes>
      <Route path={`form-templates/new`} element={<CustomFormTemplate />} />
      {pages.map((page) => (
        <Route key={page.path} path={page.path} element={<page.Component />} />
      ))}
      <Route path="" element={<AdminDashboard />} />
    </Routes>
  );
};

const adminTabContext = createContext<AdminTabContext>(null!);
const AdminTabsContextProvider = ({ children }: PropsWithChildren) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const context = {
    activeTabIndex: activeTabIndex,
    setActiveTabIndex: setActiveTabIndex,
  };

  return (
    <adminTabContext.Provider value={context}>
      {children}
    </adminTabContext.Provider>
  );
};

const AdminDashboard = () => {
  return (
    <DashboardPaper>
      <AdminTabsContextProvider>
        <AdminDashboardTabs />
      </AdminTabsContextProvider>
    </DashboardPaper>
  );
};
const AdminDashboardTabs = () => {
  const { activeTabIndex, setActiveTabIndex } =
    useContext<AdminTabContext>(adminTabContext);
  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setActiveTabIndex(newValue);
    },
    [setActiveTabIndex]
  );

  return (
    <>
      <Tabs value={activeTabIndex} onChange={handleChange}>
        {pages.map((page) => (
          <Tab key={page.path} label={page.name} />
        ))}
      </Tabs>

      {pages.map((page, index) => (
        <AdminTabPanel
          key={page.path}
          index={index}
          activeTabIndex={activeTabIndex}>
          <page.Component />
        </AdminTabPanel>
      ))}
    </>
  );
};

type AdminTabPanelProps = PropsWithChildren & {
  index: number;
  activeTabIndex: number;
};
const AdminTabPanel = ({
  children,
  index,
  activeTabIndex,
}: AdminTabPanelProps) => {
  const show = index === activeTabIndex;
  return show ? <>{children}</> : null;
};

type AdminTabContext = {
  activeTabIndex: number;
  setActiveTabIndex: React.Dispatch<React.SetStateAction<number>>;
};
