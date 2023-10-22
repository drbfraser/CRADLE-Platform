import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material';
import {
  CancelButton,
  PrimaryButton,
} from '../../../../shared/components/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { McOption, QuestionLangVersion, TQuestion } from 'src/shared/types';
import { QuestionTypeEnum } from 'src/shared/enums';

interface IProps {
  open: boolean;
  onClose: () => void;
  inputLanguages: string[];
  setNestedQs?: Dispatch<SetStateAction<TQuestion[][]>>;
  question?: TQuestion;
  categoryIndex: number;
}

const EditCategory = ({
  open,
  onClose,
  inputLanguages,
  setNestedQs,
  question,
  categoryIndex,
}: IProps) => {
  const [questionLangVersions, setQuestionLangversions] = useState<
    QuestionLangVersion[]
  >([] as QuestionLangVersion[]);
  const [fieldChanged, setFieldChanged] = useState(false);
  const [formDirty, setFormDirty] = useState(false);

  const getQLangVersionsCopy = (
    questionLangVersions: QuestionLangVersion[]
  ): QuestionLangVersion[] => {
    const qLangVersions = [] as QuestionLangVersion[];
    questionLangVersions.forEach((qLangVersion) => {
      const mcOptions = [] as McOption[];
      if (qLangVersion.mcOptions) {
        qLangVersion.mcOptions.forEach((mcOption) => {
          mcOptions.push({
            mcid: mcOption.mcid,
            opt: mcOption.opt,
          });
        });
      }
      qLangVersions.push({
        lang: qLangVersion.lang,
        mcOptions: mcOptions,
        questionText: qLangVersion.questionText,
      });
    });
    return qLangVersions;
  };

  useEffect(() => {
    // edit field
    if (formDirty) {
      setQuestionLangversions(questionLangVersions);
    } else {
      if (question) {
        setQuestionLangversions(
          getQLangVersionsCopy(question.questionLangVersions)
        );
      }
      // create new field
      else {
        setQuestionLangversions([]);
      }
    }
    // Check if all fields are filled
    // Enable/disable save button based on filled fields
  }, [open, setNestedQs, fieldChanged]);

  const getFieldName = (language: string) => {
    let fName = '';
    if (question) {
      const qLangVersion = question.questionLangVersions.find(
        (version) => version.lang === language
      );
      if (qLangVersion) {
        fName = qLangVersion.questionText;
      }
    }
    return fName;
  };

  const addFieldToQuestionLangVersions = (
    language: string,
    fieldName: string
  ) => {
    const qLangVersions: QuestionLangVersion[] = questionLangVersions;

    const newQLangVersion = {
      lang: language,
      mcOptions: [] as McOption[],
      questionText: fieldName,
    };

    const qLangVersion = qLangVersions.find((q) => q.lang === language);

    if (!qLangVersion) {
      qLangVersions.push(newQLangVersion);
    } else {
      const i = qLangVersions.indexOf(qLangVersion);
      qLangVersions[i].questionText = fieldName;
    }
    setQuestionLangversions(qLangVersions);
  };

  return (
    <>
      <Dialog open={open} maxWidth="lg" fullWidth>
        <DialogTitle>
          <div>
            <Typography variant="h5">
              {question ? 'Edit Category' : 'Create Category'}
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} mt={1}>
            {inputLanguages.map((lang) => (
              <Grid item xs={12} key={lang + '-category-name'}>
                <TextField
                  key={lang + '-field-text'}
                  label={lang + ' Category Name'}
                  required={true}
                  variant="outlined"
                  fullWidth
                  size="small"
                  defaultValue={getFieldName(lang)}
                  inputProps={{
                    maxLength: Number.MAX_SAFE_INTEGER,
                  }}
                  onChange={(e) => {
                    addFieldToQuestionLangVersions(lang, e.target.value);
                    setFieldChanged(!fieldChanged);
                    setFormDirty(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="button"
            onClick={(e) => {
              setFormDirty(false);
              onClose();
            }}>
            Cancel
          </CancelButton>
          <PrimaryButton
            type="submit"
            disabled={false}
            onClick={() => {
              if (setNestedQs) {
                setNestedQs((nestedQs) => {
                  // edit field
                  if (question) {
                    const questionToUpdate = nestedQs.find(
                      (q) => q[0].questionIndex === question.questionIndex
                    );
                    if (questionToUpdate) {
                      questionToUpdate[0].questionLangVersions =
                        questionLangVersions;
                    }
                  }
                  // create new field
                  else {
                    nestedQs.push([
                      {
                        questionIndex: 0,
                        questionLangVersions: questionLangVersions,
                        questionType: QuestionTypeEnum.CATEGORY,
                        required: false,
                        numMin: null,
                        numMax: null,
                        stringMaxLength: null,
                        units: null,
                        visibleCondition: [],
                        categoryIndex: categoryIndex,
                        questionId: categoryIndex + '',
                      },
                    ]);
                  }
                  console.log(categoryIndex);
                  setFormDirty(false);
                  nestedQs = [...nestedQs];
                  return nestedQs;
                });
              }
              onClose();
            }}>
            {'Save'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditCategory;
