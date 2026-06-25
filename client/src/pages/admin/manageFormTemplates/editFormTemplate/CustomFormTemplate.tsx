import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import {
  Box,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { FormTemplateWithQuestionsV2 } from 'src/shared/types/form/formTemplateTypes';
import { FormRenderStateEnum } from 'src/shared/enums';
import { CustomizedFormWQuestions } from 'src/pages/customizedForm/components/CustomizedFormWQuestions';
import {
  useFormTemplateQueryV2,
  usePreviousFormVersionsQueryV2,
} from 'src/pages/customizedForm/queries';
import { getDefaultLanguage } from './utils';
import { FormTemplateMetadataForm } from './FormTemplateMetadataForm';

export enum FormEditMainComponents {
  title = 'title',
  version = 'version',
  languages = 'languages',
}

export const initialState = {
  [FormEditMainComponents.title]: '',
  [FormEditMainComponents.version]: '1',
  [FormEditMainComponents.languages]: '',
};

export const CustomFormTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editFormId = location.state?.editFormId as string | undefined;

  const [form, setForm] = useState<FormTemplateWithQuestionsV2>({
    classification: {
      name: {
        english: 'Template',
      },
      id: undefined,
      nameStringId: undefined,
    },
    version: 1,
    questions: [],
    id: 'temp',
  });
  const [versionError, setVersionError] = useState<boolean>(false);
  const browserLanguage = getDefaultLanguage() ?? 'English';
  const [language, setLanguage] = useState<string[]>([browserLanguage]);
  const [currentLanguage, setCurrentLanguage] =
    useState<string>(browserLanguage);

  const formTemplateQuery = useFormTemplateQueryV2(editFormId);
  const previousVersionsQuery = usePreviousFormVersionsQueryV2(
    formTemplateQuery.data
  );

  useEffect(() => {
    if (formTemplateQuery.data) {
      const { id, classification, questions, version } = formTemplateQuery.data;

      setForm({
        id,
        classification,
        version,
        questions,
      });

      const langs = questions[0]?.questionText
        ? Object.keys(questions[0].questionText)
        : [browserLanguage];

      setLanguage(langs);
    }
  }, [formTemplateQuery.data]);

  const isLoading =
    editFormId &&
    formTemplateQuery.isPending &&
    previousVersionsQuery.isPending;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => navigate('/admin/form-templates')}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" component="h4">
          {editFormId
            ? `Editing Form: ${form.classification.name.english || 'Template'}`
            : 'Create New Template'}
        </Typography>
      </Box>

      {isLoading ? (
        <Skeleton variant="rectangular" height={400} />
      ) : (
        <Formik
          initialValues={initialState}
          onSubmit={() => undefined}
          validationSchema={() => {
            console.log('Temp');
          }}>
          {() => (
            <Form>
              <FormTemplateMetadataForm
                form={form}
                currentLanguage={currentLanguage}
                language={language}
                editFormId={editFormId}
                versionError={versionError}
                setForm={setForm}
                setLanguage={setLanguage}
                setVersionError={setVersionError}
                previousVersions={previousVersionsQuery.data}
              />

              <CustomizedFormWQuestions
                fm={form}
                languages={language}
                renderState={FormRenderStateEnum.SUBMIT_TEMPLATE}
                setForm={setForm}
                versionError={versionError}
                setCurrentLanguage={setCurrentLanguage}
              />
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};
