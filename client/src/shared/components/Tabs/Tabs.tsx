import { PropsWithChildren, useEffect, useState } from 'react';
import {
  Box,
  Tab as MuiTab,
  Tabs as MuiTabs,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

export type TabPanelData = {
  label: string;
  Component: () => JSX.Element;
};

type InnerTabsProps = {
  panels: TabPanelData[];
  activeTabIndex: number;
  updateTabIndex: (newIndex: number) => void;
};
const InnerTabs = ({
  panels,
  activeTabIndex,
  updateTabIndex,
}: InnerTabsProps) => {
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
        onChange={(_event, index) => updateTabIndex(index)}>
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

type TabsProps = {
  panels: TabPanelData[];
};
export const Tabs = ({ panels }: TabsProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <InnerTabs
      panels={panels}
      activeTabIndex={activeTabIndex}
      updateTabIndex={setActiveTabIndex}
    />
  );
};

// Version of Tabs that uses route segments.
export type RoutedTabPanelData = TabPanelData & {
  routeSegment: string;
};
type RoutedTabsProps = {
  panels: RoutedTabPanelData[];
};
export const RoutedTabs = ({ panels }: RoutedTabsProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const navigate = useNavigate();
  const { tab } = useParams();
  const index = panels.findIndex((panel) => panel.routeSegment === tab);
  useEffect(() => {
    if (index < 0) {
      navigate(panels[0].routeSegment);
    } else {
      setActiveTabIndex(index);
    }
  }, [index]);

  const updateTabIndex = (newIndex: number) => {
    setActiveTabIndex(newIndex);
    const routeSegment = panels[newIndex].routeSegment;
    navigate(`../${routeSegment}`);
  };

  return (
    <InnerTabs
      panels={panels}
      activeTabIndex={activeTabIndex}
      updateTabIndex={updateTabIndex}
    />
  );
};
