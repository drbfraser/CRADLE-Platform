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
    if (e.target.name === `enabled`) {
      if (!e.target.checked) {
        setUrineTest({
          ...urineTest,
          [e.target.name]: e.target.checked,
          leukocytes: '',
          blood: '',
          protein: '',
          glucose: '',
          nitrites: '',
        });
      } else {
        setUrineTest({
          ...urineTest,
          [e.target.name]: e.target.checked,
        });
      }
    } else {
      setUrineTest({
        ...urineTest,
        [e.target.name]: e.target.value,
      });
    }
  };

  const resetValueUrineTest = (reset: boolean) => {
    if (reset) {
      setUrineTest({
        enabled: true,
        leukocytes: '',
        blood: '',
        protein: '',
        glucose: '',
        nitrites: '',
      });
    }
  };
  return { urineTest, handleChangeUrineTest, resetValueUrineTest };
};
