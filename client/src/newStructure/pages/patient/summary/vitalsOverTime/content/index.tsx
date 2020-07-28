import { Loader } from '../../../../../shared/components/loader';
import React from 'react';
import { useStyles } from './styles';
import { useTimeout } from '../../../../../shared/hooks/timeout';

export const Content: React.FC = ({ children }) => {
  const classes = useStyles();

  const [loading, setLoading] = React.useState<boolean>(true);

  useTimeout({
    startTimer: true,
    timeInMs: 1250,
    onTimeoutComplete: (): void => {
      setLoading(false);
    },
  });

  return loading ? (
    <Loader
      className={classes.loader}
      message="Loading vitals..."
      show={true}
      timeout={0}
    />
  ) : (
    <>{children}</>
  );
};
