import { AppRoute } from '../../routes/utils';
import { Link } from 'react-router-dom';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useAppSelector } from 'src/shared/hooks';
import { selectSidebarIsOpen } from 'src/redux/sidebar-state';
import { ListItemButton } from '@mui/material';
import { MouseEventHandler, ReactNode } from 'react';

type SidebarRouteProps = {
  route?: AppRoute;
  icon?: ReactNode;
  title?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export const SidebarRoute: React.FC<SidebarRouteProps> = ({
  route,
  icon,
  title,
  onClick,
}) => {
  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);

  return (
    <>
      <ListItemButton
        sx={{
          display: `flex`,
          flexDirection: `column`,
          alignItems: `center`,
        }}
        component={Link}
        to={route?.to || ''}
        onClick={onClick}>
        <ListItemIcon
          sx={{
            color: `#F9FAFC`,
            justifyContent: `center`,
          }}>
          {route?.icon || icon}
        </ListItemIcon>
        {isSidebarOpen && (
          <ListItemText
            disableTypography={true}
            sx={{
              color: `white`,
            }}
            primary={
              <Typography
                sx={{
                  fontFamily: `Open Sans`,
                  fontWeight: 300,
                  fontSize: 18,
                }}>
                {route?.title || title}
              </Typography>
            }
          />
        )}
      </ListItemButton>
    </>
  );
};
