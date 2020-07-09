import { Callback, OrUndefined } from '@types';

import { GlobalSearch } from './globalSearch';
import LinearProgress from '@material-ui/core/LinearProgress';
import React from 'react';
import { ReferredPatients } from './referredPatients';
import { Search } from './search';
import { useStyles } from './styles';

interface IProps {
  loading: boolean;
  toggleShowReferredPatients: () => void;
  toggleGlobalSearch: Callback<boolean>;
  updateSearchText: Callback<OrUndefined<string>>;
  globalSearch?: boolean;
  globalSearchAction?: boolean;
  searchText?: string;
  showReferredPatients?: boolean;
}

const Toolbar: React.FC<IProps> = ({
  loading,
  showReferredPatients,
  toggleShowReferredPatients,
  toggleGlobalSearch,
  globalSearchAction = false,
  ...props
}) => {
  const [showLoader, setShowLoader] = React.useState<boolean>(false);
  const classes = useStyles();

  React.useEffect((): (() => void) => {
    let timeout: OrUndefined<NodeJS.Timeout>;

    if (loading) {
      //* Timeout used here to prevent
      //* showing loader if data comes back very quickly

      //* This makes the UI feel faster to the user
      //* if we do not need to show a loading state
      timeout = setTimeout((): void => {
        if (loading) {
          setShowLoader(true);
        }
      }, 500);
    } else {
      setShowLoader(false);
    }

    return (): void => {
      //* Whenever loading state updates clear the previous timeout
      //* Prevents memory leaks
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [loading]);

  return (
    <>
      {showLoader && (
        <LinearProgress
          className={classes.linearProgress}
          color="primary"
          variant="indeterminate"
        />
      )}
      <div id="firstActions" className={classes.toolbarActions}>
        <Search {...props} />
        {globalSearchAction && (
          <GlobalSearch
            className={classes.spacedAction}
            globalSearch={props.globalSearch}
            toggleGlobalSearch={toggleGlobalSearch}
          />
        )}
        <ReferredPatients
          showReferredPatients={showReferredPatients}
          toggleShowReferredPatients={toggleShowReferredPatients}
        />
      </div>
    </>
  );
};

export const customToolbarRender = (args: IProps): (() => JSX.Element) => {
  return (): JSX.Element => <Toolbar {...args} />;
};
