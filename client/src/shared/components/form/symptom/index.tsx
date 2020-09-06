import { CheckboxProps, Form, Header, TextAreaProps } from 'semantic-ui-react';

import Paper from '@material-ui/core/Paper';
import React from 'react';
import { SymptomEnum } from '../../../../enums';
import { useStyles } from '../styles';

interface IProps {
  selectedSymptoms: Record<SymptomEnum, boolean>;
  otherSymptoms: string;
  onSelectedSymptomsChange?: (
    event: React.FormEvent<HTMLInputElement>,
    data: CheckboxProps
  ) => void;
  onOtherSymptomsChange?: (
    event: React.FormEvent<HTMLTextAreaElement>,
    data: TextAreaProps
  ) => void;
}

export const SymptomForm: React.FC<IProps> = ({
  selectedSymptoms,
  otherSymptoms,
  onSelectedSymptomsChange,
  onOtherSymptomsChange,
}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.container}>
      <Header>
        <b>Symptoms</b>
      </Header>
      <div>
        <Form.Checkbox
          className={classes.input}
          checked={selectedSymptoms[SymptomEnum.NONE]}
          value={SymptomEnum.NONE}
          name={SymptomEnum.NONE.toLowerCase().replace(
            / [a-z]/g,
            (match: string): string => match[1].toUpperCase()
          )}
          label="None (Patient healthy)"
          onChange={onSelectedSymptomsChange}
        />
        <Form.Group widths="equal">
          <Form.Checkbox
            className={classes.input}
            checked={selectedSymptoms[SymptomEnum.HEADACHE]}
            value={SymptomEnum.HEADACHE}
            name={SymptomEnum.HEADACHE.toLowerCase().replace(
              / [a-z]/g,
              (match: string): string => match[1].toUpperCase()
            )}
            label={SymptomEnum.HEADACHE}
            onChange={onSelectedSymptomsChange}
          />
          <Form.Checkbox
            className={classes.input}
            checked={selectedSymptoms[SymptomEnum.BLEEDING]}
            value={SymptomEnum.BLEEDING}
            name={SymptomEnum.BLEEDING.toLowerCase()}
            label={SymptomEnum.BLEEDING}
            onChange={onSelectedSymptomsChange}
          />
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Checkbox
            className={classes.input}
            checked={selectedSymptoms[SymptomEnum.BLURRED_VISION]}
            value={SymptomEnum.BLURRED_VISION}
            name={SymptomEnum.BLURRED_VISION.toLowerCase().replace(
              / [a-z]/g,
              (match: string): string => match[1].toUpperCase()
            )}
            label={SymptomEnum.BLURRED_VISION}
            onChange={onSelectedSymptomsChange}
          />
          <Form.Checkbox
            className={classes.input}
            checked={selectedSymptoms[SymptomEnum.FEVERISH]}
            value={SymptomEnum.FEVERISH}
            name={SymptomEnum.FEVERISH.toLowerCase()}
            label={SymptomEnum.FEVERISH}
            onChange={onSelectedSymptomsChange}
          />
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Checkbox
            className={classes.input}
            checked={selectedSymptoms[SymptomEnum.ABDOMINAL_PAIN]}
            value={SymptomEnum.ABDOMINAL_PAIN}
            name={SymptomEnum.ABDOMINAL_PAIN.toLowerCase().replace(
              / [a-z]/g,
              (match: string): string => match[1].toUpperCase()
            )}
            label={SymptomEnum.ABDOMINAL_PAIN}
            onChange={onSelectedSymptomsChange}
          />
          <Form.Checkbox
            className={classes.input}
            checked={selectedSymptoms[SymptomEnum.UNWELL]}
            value={SymptomEnum.UNWELL}
            name={SymptomEnum.UNWELL.toLowerCase()}
            label={SymptomEnum.UNWELL}
            onChange={onSelectedSymptomsChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Checkbox
            className={classes.input}
            checked={selectedSymptoms[SymptomEnum.OTHER]}
            value={SymptomEnum.OTHER}
            widths="3"
            name={SymptomEnum.OTHER.toLowerCase()}
            label="Other:"
            onChange={onSelectedSymptomsChange}
          />
          <Form.TextArea
            className={classes.input}
            widths="1"
            name="otherSymptoms"
            value={otherSymptoms}
            onChange={onOtherSymptomsChange}
            disabled={!selectedSymptoms[SymptomEnum.OTHER]}
          />
        </Form.Group>
      </div>
    </Paper>
  );
};
