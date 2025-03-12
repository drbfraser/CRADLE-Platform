import { CommunityWorkerResources } from './CommunityWorkerResource';
import { HealthWorkerResources } from './HealthWorkerResources';
import { Tabs } from 'src/shared/components/Tabs/Tabs';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { DASHBOARD_PADDING } from 'src/shared/constants';

const panels = [
  {
    label: 'Community Worker',
    Component: () => <CommunityWorkerResources />,
  },
  {
    label: 'Health Facility Worker',
    Component: () => <HealthWorkerResources />,
  },
];

export const COMMUNITY_WORKER_EDUCATION_VIDEO_LINK =
  'https://www.youtube.com/embed/WvS3L5P4P2c';
export const HEALTH_FACILITY_WORKER_EDUCATION_VIDEO_LINK =
  'https://www.youtube.com/embed/QainNBCHKAg';

// const TabExampleBasicAll = () => <Tab panes={panes} renderActiveOnly={false} />;

export const ResourcesPage = () => {
  return (
    <DashboardPaper
      sx={{
        padding: DASHBOARD_PADDING,
      }}>
      <Tabs panels={panels} />
    </DashboardPaper>
  );
};
