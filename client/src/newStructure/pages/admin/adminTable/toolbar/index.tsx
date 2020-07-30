import { Callback, OrUndefined } from '@types';

import { DefaultSearch } from '../../../../shared/components/defaultSearch';
import LinearProgress from '@material-ui/core/LinearProgress';
import React from 'react';
import { useStyles } from '../../../../shared/styles/toolbar';
import { useTimeout } from '../../../../shared/hooks/timeout';

interface IProps {
  loading: boolean;
  updateSearchText: Callback<OrUndefined<string>>;
  searchText?: string;
}

const Toolbar: React.FC<IProps> = ({ loading, ...props }) => {
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
      </div>
    </>
  );
};

export const customToolbarRender = (args: IProps): (() => JSX.Element) => {
  return (): JSX.Element => <Toolbar {...args} />;
};
