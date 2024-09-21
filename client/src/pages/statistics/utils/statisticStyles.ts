import { SxProps, Theme } from '@mui/material';

export const DIVIDER_SX: SxProps = {
  marginY: '20px',
};

export const STATISTICS_SX: SxProps<Theme> = (theme) => ({
  width: '200px',
  height: '100px',
  padding: theme.spacing(1, 0, 1, 2),
  border: `1px solid rgb(211, 205, 205)`,
  borderRadius: 7,
  boxShadow: `3px 1px rgb(211, 205, 205)`,
});

export const STATISTICS_LABEL_SX: SxProps<Theme> = (theme) => ({
  width: '100px',
  margin: theme.spacing(0, `auto`),
});

export const STATISTICS_GROUP: SxProps<Theme> = (theme) => ({
  paddingBlockEnd: theme.spacing(2),
});

export const TAB_SX: SxProps = {
  display: `fluid`,
  flexDirection: `row`,
  flexWrap: `wrap`,
};

export const CHART_SX: SxProps = {
  position: 'relative',
  margin: 'auto',
  width: `100%`,
  height: '100%',
};

export const FORM_CTRL_SX: SxProps = {
  margin: '4px 8px',
  minWidth: '180px',
};
