import React from 'react';
import { useStyles } from './styles';

interface IProps {
  symptoms: Array<string>;
}

export const Symptoms: React.FC<IProps> = ({ symptoms }) => {
  const classes = useStyles();

  const filteredSymptoms = React.useMemo((): Array<string> => {
    return symptoms.filter((symptom: string): boolean =>
      Boolean(symptom.trim())
    );
  }, [symptoms]);

  return (
    <>
      {filteredSymptoms.length ? (
        <div className={classes.container}>
          <b>Symptoms:</b>
          <p className={classes.content}>
            {symptoms.map(
              (symptom: string, index: number): JSX.Element => (
                <span key={index}>{symptom}</span>
              )
            )}
          </p>
        </div>
      ) : null}
    </>
  );
};
