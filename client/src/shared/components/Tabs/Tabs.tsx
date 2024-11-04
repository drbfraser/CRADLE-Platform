import { PropsWithChildren, useState } from 'react';
import {
  Box,
  Tab as MuiTab,
  Tabs as MuiTabs,
  useMediaQuery,
  useTheme,
} from '@mui/material';

type TabPanelData = {
  label: string;
  Component: () => JSX.Element;
};

type TabsProps = {
  panels: TabPanelData[];
};
export const Tabs = ({ panels }: TabsProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const theme = useTheme();
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Box>
      <MuiTabs
        variant={isXSmallScreen ? 'fullWidth' : 'scrollable'}
        scrollButtons={'auto'}
        allowScrollButtonsMobile
        sx={{
          overflow: 'hidden',
          width: '100%',
          '& .MuiTab-root': {
            fontSize: {
              lg: 'medium',
              md: 'small',
              sm: 'x-small',
              xs: 'xx-small',
            },
            padding: {
              md: '16px',
              sm: '8px',
              xs: '4px',
            },
            minWidth: {
              md: '90px',
              xs: '50px',
            },
          },
        }}
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
