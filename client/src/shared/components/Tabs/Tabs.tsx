import { PropsWithChildren, useState } from 'react';
import { Box, Tab as MuiTab, Tabs as MuiTabs } from '@mui/material';

type TabPanelData = {
  label: string;
  Component: () => JSX.Element;
};

type TabsProps = {
  panels: TabPanelData[];
};
export const Tabs = ({ panels }: TabsProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <Box>
      <MuiTabs
        value={activeTabIndex}
        onChange={(_event, index) => setActiveTabIndex(index)}>
        {panels.map((panel) => (
          <MuiTab label={panel.label} key={panel.label} />
        ))}
      </MuiTabs>
      {panels.map((panel, index) => (
        <TabPanel
          key={panel.label}
          index={index}
          activeTabIndex={activeTabIndex}>
          <panel.Component />
        </TabPanel>
      ))}
    </Box>
  );
};

type TabPanelProps = PropsWithChildren & {
  index: number;
  activeTabIndex: number;
};
const TabPanel = ({ children, index, activeTabIndex }: TabPanelProps) => {
  return index === activeTabIndex ? <>{children}</> : null;
};
