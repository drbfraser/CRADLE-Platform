import { Box, useMediaQuery, useTheme } from '@mui/material';
import { PropsWithChildren } from 'react';
import { Sidebar } from '.';
import { useAppSelector } from 'src/shared/hooks';
import { selectSidebarIsOpen } from 'src/redux/sidebar-state';
import {
  DASHBOARD_PADDING,
  DRAWER_NARROW,
  DRAWER_WIDE,
} from 'src/shared/constants';

type SidebarWrapperProps = PropsWithChildren;
export const SidebarWrapper = ({ children }: SidebarWrapperProps) => {
  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);

  const theme = useTheme();
  const drawerWidth = isSidebarOpen ? DRAWER_WIDE : DRAWER_NARROW;
  const isBigScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const width = isBigScreen ? `calc(100vw - ${drawerWidth})` : '100%';

  return (
    <Box
      id={'sidebar-wrapper'}
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
      }}>
      <Sidebar drawerWidth={drawerWidth} isBigScreen={isBigScreen} />
      <Box
        component={'main'}
        id={'main-container'}
        sx={{
          height: '100%',
          width: width,
          padding: DASHBOARD_PADDING,
        }}>
        {children}
      </Box>
    </Box>
  );
};
