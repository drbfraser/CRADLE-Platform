import React from 'react';

export const CurrentMonthContext = React.createContext<number>(0);

export const CurrentMonthContextProvider: React.FC = ({ children }) => {
  const currentMonth = React.useRef(new Date().getMonth());

  return (
    <CurrentMonthContext.Provider value={currentMonth.current}>
      {children}
    </CurrentMonthContext.Provider>
  );
};
