import { OrUndefined } from 'src/types';
import React from 'react';

interface IArgs {
  startTimer: boolean;
  onTimeoutComplete: () => void;
  timeInMs?: number;
  onWithoutTimeout?: () => void;
}

export const useTimeout = ({
  startTimer,
  onTimeoutComplete,
  timeInMs = 500,
  onWithoutTimeout,
}: IArgs) => {
  React.useEffect((): (() => void) => {
    let timeout: OrUndefined<NodeJS.Timeout>;

    if (startTimer) {
      timeout = setTimeout((): void => {
        if (startTimer) {
          onTimeoutComplete();
        }
      }, timeInMs);
    } else {
      onWithoutTimeout?.();
    }

    return (): void => {
      //* Whenever startTimer updates clear the previous timeout
      //* Prevents memory leaks
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [startTimer, onTimeoutComplete, onWithoutTimeout, timeInMs]);
};
