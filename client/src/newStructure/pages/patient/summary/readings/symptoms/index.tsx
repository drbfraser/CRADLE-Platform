import React from 'react';
import { useStyles } from './styles';

interface IProps {
  symptoms?: Array<string>;
}

export const Symptoms: React.FC<IProps> = ({ symptoms }) => {
  const classes = useStyles();

  const filteredSymptoms = React.useMemo((): Array<string> => {
    return (symptoms || [])
      .map((symptom: string): string => {
        const trimmedSymptom = symptom.trim();
        return `${trimmedSymptom[0].toUpperCase()}${trimmedSymptom
          .substring(1)
          .toLowerCase()}`;
      })
      .filter((symptom: string): boolean => Boolean(symptom));
  }, [symptoms]);

  return (
    <>
      {filteredSymptoms.length ? (
        <div className={classes.container}>
          <b>Symptoms:</b>
          <p className={classes.content}>
            {filteredSymptoms.map(
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
