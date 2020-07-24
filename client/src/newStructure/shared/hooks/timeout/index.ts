import { OrUndefined } from '@types';
import React from 'react';

interface IArgs {
  startTimer: boolean;
  onTimeoutComplete: () => void;
  onWithoutTimeout: () => void;
  timeInMs?: number;
}

export const useTimeout = ({
  startTimer,
  onTimeoutComplete,
  onWithoutTimeout,
  timeInMs = 500,
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
      onWithoutTimeout();
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
