import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Table,
  TableCell,
  TableRow,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  CancelButton,
  PrimaryButton,
} from '../../../../shared/components/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { TableHeader } from 'semantic-ui-react';
import {
  FormTemplateWithQuestions,
  QuestionLangVersion,
} from 'src/shared/types';
import { QuestionTypeEnum } from 'src/shared/enums';

interface IProps {
  open: boolean;
  onClose: () => void;
  inputLanguages: string[];
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestions>>;
  form: FormTemplateWithQuestions;
}

interface FieldTypes {
  [key: string]: {
    value: string;
    label: string;
    type: QuestionTypeEnum;
    render: () => JSX.Element;
  };
}

const EditField = ({
  open,
  onClose,
  inputLanguages,
  setForm,
  form,
}: IProps) => {
  const [fieldType, setFieldType] = useState<string>('');
  const [questionId, setQuestionId] = useState<string>('');
  const [questionLangVersions, setQuestionLangversions] = useState<
    QuestionLangVersion[]
  >([]);

  // reset chosen field to nothing once dialog is closed
  useEffect(() => {
    setFieldType('');
    setQuestionId('');
    setQuestionLangversions([]);
  }, [open]);

  const addFieldToQuestionLangVersions = (
    language: string,
    fieldName: string
  ) => {
    const qLangVersions: QuestionLangVersion[] = questionLangVersions;

    const newQLangVersion = {
      lang: language,
      mcOptions: [],
      questionText: fieldName,
    };

    const qLangVersion = qLangVersions.find((q) => q.lang === language);

    if (!qLangVersion) {
      qLangVersions.push(newQLangVersion);
    } else {
      const i = qLangVersions.indexOf(qLangVersion);
      qLangVersions[i] = newQLangVersion;
    }

    setQuestionLangversions(qLangVersions);
  };

  const fieldTypes: FieldTypes = {
    category: {
      value: 'category',
      label: 'Category',
      type: QuestionTypeEnum.CATEGORY,
      render: () => <></>,
    },
    number: {
      value: 'number',
      label: 'Number',
      type: QuestionTypeEnum.INTEGER,
      render: () => (
        <>
          {/*TODO: Handle what is displayed when Number field type is selected*/}
        </>
      ),
    },
    text: {
      value: 'text',
      label: 'Text',
      type: QuestionTypeEnum.STRING,
      render: () => (
        <>
          {/*TODO: Handle what is displayed when Text field type is selected*/}
        </>
      ),
    },
    mult_choice: {
      value: 'mult_choice',
      label: 'Multiple Choice',
      type: QuestionTypeEnum.MULTIPLE_CHOICE,
      render: () => (
        <Table>
          <TableRow>
            {inputLanguages.map((lang) => (
              <TableCell size="small" key={lang + 'mult-choice-option-1-body'}>
                {/*TODO: Create ability to create multiple options in multiple choice*/}
                <TextField
                  key={lang + '-field-name-mult-choice-option1'}
                  label={lang + ' Option 1'}
                  required={true}
                  variant="outlined"
                  fullWidth
                  multiline
                  size="small"
                  inputProps={{
                    // TODO: Determine what types of input restrictions we should have for multiple choice option
                    maxLength: Number.MAX_SAFE_INTEGER,
                  }}
                />
              </TableCell>
            ))}
            <TableCell>
              <CancelButton>
                <RemoveCircleOutlineIcon />
              </CancelButton>
            </TableCell>
          </TableRow>
        </Table>
      ),
    },
    date: {
      value: 'date',
      label: 'Date',
      type: QuestionTypeEnum.DATE,
      render: () => (
        <>
          {/*TODO: Handle what is displayed when Date field type is selected*/}
        </>
      ),
    },
  };
  const handleRadioChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setFieldType(event.target.value);
  };

  return (
    <>
      <Dialog open={open} maxWidth="lg" fullWidth>
        <DialogTitle>Create Field</DialogTitle>
        <DialogContent>
          <Table>
            <TableHeader>
              <TableRow>
                {inputLanguages.map((lang) => (
                  <TableCell key={lang + '-title'}>{lang}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableRow>
              {inputLanguages.map((lang) => (
                <TableCell size="small" key={lang + '-body'}>
                  <TextField
                    key={lang + '-field-name'}
                    label={lang + ' Field Name'}
                    required={true}
                    variant="outlined"
                    fullWidth
                    multiline
                    size="small"
                    inputProps={{
                      maxLength: Number.MAX_SAFE_INTEGER,
                    }}
                    onChange={(e) =>
                      addFieldToQuestionLangVersions(lang, e.target.value)
                    }
                  />
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell key="question-id-cell">
                <TextField
                  label={'Question ID'}
                  key={'question-id'}
                  required={true}
                  variant="outlined"
                  fullWidth
                  multiline
                  size="small"
                  inputProps={{
                    maxLength: Number.MAX_SAFE_INTEGER,
                  }}
                  onChange={(e) => setQuestionId(e.target.value)}
                />
              </TableCell>
            </TableRow>
          </Table>
          <br />
          <Grid container spacing={3}>
            <Grid item sm={12} md={2} lg={2}>
              <FormLabel id="field-type-label">
                <Typography variant="h6">Field Type</Typography>
              </FormLabel>
            </Grid>
            <Grid item sm={12} md={10} lg={10}>
              <RadioGroup
                aria-labelledby="field-type-label"
                name="field-type-group"
                row
                onChange={handleRadioChange}>
                {Object.values(fieldTypes).map((field) => (
                  <FormControlLabel
                    key={field.label}
                    value={field.value}
                    control={<Radio />}
                    label={field.label}
                  />
                ))}
              </RadioGroup>
            </Grid>
          </Grid>

          {fieldType
            ? // TODO: Remove @ts-ignore
              // @ts-ignore
              fieldTypes[fieldType].render()
            : ''}
        </DialogContent>
        <DialogActions>
          <CancelButton type="button" onClick={onClose}>
            Cancel
          </CancelButton>
          <PrimaryButton
            type="submit"
            onClick={() => {
              setForm((form) => {
                form.questions.push({
                  questionIndex: form.questions.length + 1,
                  questionLangVersions: questionLangVersions,
                  questionType: fieldTypes[fieldType].type,
                  required: false,
                  numMin: null,
                  numMax: null,
                  stringMaxLength: null,
                  units: null,
                  visibleCondition: [],
                  categoryIndex: null,
                  questionId: questionId,
                });
                form.questions = [...form.questions];
                return form;
              });
              onClose();
            }}>
            {/* disabled={isSubmitting || !isValid}>*/}
            {/* {creatingNew ? 'Create' : 'Save'}*/}
            {'Save'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditField;
