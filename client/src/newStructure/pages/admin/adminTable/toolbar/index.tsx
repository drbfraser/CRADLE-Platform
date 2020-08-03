import { Callback, OrUndefined } from '@types';

import { CreateUser } from './createUser';
import { DefaultSearch } from '../../../../shared/components/defaultSearch';
import LinearProgress from '@material-ui/core/LinearProgress';
import React from 'react';
import { useStyles } from '../../../../shared/styles/toolbar';
import { useTimeout } from '../../../../shared/hooks/timeout';

interface IProps {
  loading: boolean;
  updateSearchText: Callback<OrUndefined<string>>;
  searchPlaceholder?: string;
  searchText?: string;
}

const Toolbar: React.FC<IProps> = ({
  loading,
  searchPlaceholder,
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
        <DefaultSearch {...props} placeholder={searchPlaceholder} />
        <div className={classes.spacedAction}>
          <CreateUser />
        </div>
      </div>
    </>
  );
};

export const customToolbarRender = (args: IProps): (() => JSX.Element) => {
  return (): JSX.Element => <Toolbar {...args} />;
};
