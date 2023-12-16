import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  CancelButton,
  PrimaryButton,
} from '../../../../shared/components/Button';
import * as handlers from './multiFieldComponents/handlers';
import InfoIcon from '@mui/icons-material/Info';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  FormTemplateWithQuestions,
  McOption,
  QCondition,
  QuestionLangVersion,
  TQuestion,
} from 'src/shared/types';
import { QuestionTypeEnum } from 'src/shared/enums';
import EditVisibleCondition from './EditVisibleCondition';

interface IProps {
  open: boolean;
  onClose: () => void;
  inputLanguages: string[];
  setForm?: Dispatch<SetStateAction<FormTemplateWithQuestions>>;
  question?: TQuestion;
  questionsArr: TQuestion[];
  visibilityToggle: boolean;
  categoryIndex: number | null;
}

const EditCategory = ({
  open,
  onClose,
  inputLanguages,
  setForm,
  question,
  questionsArr,
  visibilityToggle,
  categoryIndex,
}: IProps) => {
  const [questionLangVersions, setQuestionLangversions] = useState<
    QuestionLangVersion[]
  >([] as QuestionLangVersion[]);
  const [fieldChanged, setFieldChanged] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [visibleCondition, setVisibleCondition] = useState<QCondition[]>([]);
  const [enableVisibility, setEnableVisiblity] = useState(visibilityToggle);

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
      setEnableVisiblity(enableVisibility);
    } else {
      if (question) {
        setQuestionLangversions(
          getQLangVersionsCopy(question.questionLangVersions)
        );
        setEnableVisiblity(
          enableVisibility || question.visibleCondition.length > 0
        );
      }
      // create new field
      else {
        setQuestionLangversions([]);
        setEnableVisiblity(false);
      }
    }
  }, [open, setForm, fieldChanged]);

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
            {questionsArr.filter(
              (q) =>
                q.questionType != QuestionTypeEnum.CATEGORY &&
                q.categoryIndex != question?.questionIndex
            ).length > 0 && (
              <>
                <Grid item container sm={12} md={10} lg={10}>
                  <FormControlLabel
                    style={{ marginLeft: 0 }}
                    control={
                      <Switch
                        checked={enableVisibility}
                        onChange={(e) =>
                          handlers.handleVisibilityChange(
                            e,
                            setEnableVisiblity,
                            setFormDirty,
                            setFieldChanged,
                            fieldChanged
                          )
                        }
                        data-testid="conditional-switch"
                      />
                    }
                    label={
                      <FormLabel id="vis-label" style={{ display: 'flex' }}>
                        <Typography variant="h6">
                          Conditional Visibility
                        </Typography>
                        <Tooltip
                          disableFocusListener
                          disableTouchListener
                          title={
                            'Set this field to only appear after a specific field value is entered'
                          }
                          arrow
                          placement="right">
                          <IconButton>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </FormLabel>
                    }
                    labelPlacement="start"
                  />
                </Grid>
                {enableVisibility ? (
                  <Grid item sm={12} md={10} lg={10}>
                    <EditVisibleCondition
                      currQuestion={question}
                      filteredQs={questionsArr.filter(
                        (q) =>
                          q.questionType != QuestionTypeEnum.CATEGORY &&
                          q.categoryIndex != question?.questionIndex
                      )}
                      setVisibleCondition={setVisibleCondition}
                      setFieldChanged={setFieldChanged}
                      origFieldChanged={fieldChanged}
                    />
                  </Grid>
                ) : null}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="button"
            onClick={(e) => {
              setFormDirty(false);
              setEnableVisiblity(false);
              onClose();
            }}>
            Cancel
          </CancelButton>
          <PrimaryButton
            type="submit"
            disabled={false}
            onClick={() => {
              if (setForm) {
                if (question && !enableVisibility) {
                  question.visibleCondition.length = 0;
                }
                setForm((form) => {
                  // edit field
                  if (question) {
                    const questionToUpdate = form.questions.find(
                      (q) => q.questionIndex === question.questionIndex
                    );
                    if (questionToUpdate) {
                      questionToUpdate.questionLangVersions =
                        questionLangVersions;
                      questionToUpdate.visibleCondition = enableVisibility
                        ? visibleCondition
                        : [];
                    }
                  }
                  // create new field
                  else {
                    form.questions.push({
                      questionIndex: form.questions.length,
                      questionLangVersions: questionLangVersions,
                      questionType: QuestionTypeEnum.CATEGORY,
                      required: false,
                      numMin: null,
                      numMax: null,
                      stringMaxLength: null,
                      units: null,
                      visibleCondition: visibleCondition,
                      categoryIndex: categoryIndex,
                      questionId: undefined,
                    });
                  }
                  setVisibleCondition([]);
                  setFormDirty(false);
                  form.questions = [...form.questions];
                  return form;
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
