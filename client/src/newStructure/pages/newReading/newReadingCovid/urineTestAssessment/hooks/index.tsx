import React from 'react';

export const useNewUrineTest = () => {
  const [urineTest, setUrineTest] = React.useState({
    enabled: true,
    leukocytes: '',
    blood: '',
    protein: '',
    glucose: '',
    nitrites: '',
  });
  const handleChangeUrineTest = (e: any) => {
    if (e.target.name == 'enabled') {
      setUrineTest({
        ...urineTest,
        [e.target.name]: e.target.checked,
      });
    } else {
      setUrineTest({
        ...urineTest,
        [e.target.name]: e.target.value,
      });
    }
  };
  return { urineTest, handleChangeUrineTest };
};
