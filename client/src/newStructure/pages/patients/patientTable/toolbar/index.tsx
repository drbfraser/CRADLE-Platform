import { Callback, OrUndefined } from '@types';

import { DefaultSearch } from '../../../../shared/components/defaultSearch';
import { GlobalSearch } from './globalSearch';
import LinearProgress from '@material-ui/core/LinearProgress';
import React from 'react';
import { ReferredPatients } from './referredPatients';
import { useStyles } from '../../../../shared/styles/toolbar';
import { useTimeout } from '../../../../shared/hooks/timeout';

interface IProps {
  loading: boolean;
  updateSearchText: Callback<OrUndefined<string>>;
  globalSearch?: boolean;
  globalSearchAction?: boolean;
  searchText?: string;
  showReferredPatients?: boolean;
}

const Toolbar: React.FC<IProps> = ({
  loading,
  showReferredPatients,
  globalSearchAction = false,
  ...props
}) => {
  const [showLoader, setShowLoader] = React.useState<boolean>(false);
  const classes = useStyles();
  useTimeout({
    startTimer: loading,
    onTimeoutComplete: (): void => {
      setShowLoader(true);
    },
    onWithoutTimeout: (): void => {
      setShowLoader(false);
    },
  });

  return (
    <>
      {showLoader && (
        <LinearProgress
          className={classes.linearProgress}
          color="primary"
          variant="indeterminate"
        />
      )}
      <div className={classes.toolbarActions}>
        <DefaultSearch {...props} />
        {globalSearchAction && (
          <GlobalSearch
            className={classes.spacedAction}
            globalSearch={props.globalSearch}
          />
        )}
        <ReferredPatients showReferredPatients={showReferredPatients} />
      </div>
    </>
  );
};

export const customToolbarRender = (args: IProps): (() => JSX.Element) => {
  return (): JSX.Element => <Toolbar {...args} />;
};
