import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import {
  Box,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
  TemplateStep,
  WorkflowTemplate,
} from 'src/shared/types/workflow/workflowTypes';
import { useQuery } from '@tanstack/react-query';
import { getTemplate } from 'src/shared/api/modules/workflowTemplates';
import { ViewTemplateSteps } from './ViewTemplateSteps';

export enum WorkflowEditMainComponents {
  title = 'wtitle',
  version = 'wversion',
}

export const initialState = {
  [WorkflowEditMainComponents.title]: '',
  [WorkflowEditMainComponents.version]: '1',
};

export const CustomWorkflowTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editWorkflowId = location.state?.editWorkflowId as string | undefined;

  const [workflow, setWorkflow] = useState<WorkflowTemplate>({
    id: '',
    name: '',
    description: '',
    version: 1,
    classificationId: '',
    initialConditions: undefined,
    steps: [],
    archived: false,
    dateCreated: 0,
    lastEdited: 0,
    lastEditedBy: '',
  });

  const dummyStep: TemplateStep = {
    id: '1',
    name: 'name',
    title: 'step1',
    formId: 'form-id',
    expectedCompletion: 'date',
    conditions: undefined,
    next: undefined,
    archived: false,
    lastEdited: 'date',
    lastEditedBy: 'date',
  };
  const dummyWF: WorkflowTemplate = {
    id: '1',
    name: 'dummy workflow',
    description: 'this is a dummy',
    version: 1,
    classificationId: '1',
    initialConditions: undefined,
    steps: [dummyStep],
    archived: false,
    dateCreated: 1,
    lastEdited: 1,
    lastEditedBy: 'date',
  };

  const [versionError, setVersionError] = useState<boolean>(false);

  const useWorkflowTemplateQuery = (workflowId: string | undefined) =>
    useQuery({
      queryKey: ['workflowTemplate', workflowId],
      queryFn: () => getTemplate(workflowId!),
      enabled: !!workflowId,
    });
  const workflowTemplateQuery = useWorkflowTemplateQuery(editWorkflowId);

  useEffect(() => {
    if (workflowTemplateQuery.data) {
      //const wft = workflowTemplateQuery.data;
      //setWorkflow(wft);
      setWorkflow(dummyWF);
      setVersionError(true);
    }
  }, [workflowTemplateQuery.data]);

  const isLoading =
    editWorkflowId &&
    workflowTemplateQuery.isPending;

  return (
    <>
      <Box sx={{ display: `flex`, alignItems: `center` }}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => navigate(`/admin/workflow-templates`)}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant={'h4'} component={'h4'}>
          {editWorkflowId
            ? 'Edit Workflow Template'
            : 'Create New Workflow Template'}
        </Typography>
      </Box>

      {isLoading ? (
        <Skeleton variant="rectangular" height={400} />
      ) : (
        <Formik
          initialValues={initialState}
          onSubmit={() => {
            console.log('Temp');
          }}
        >
          {() => (
            <Form>
              <Paper sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <h2>Custom Workflow Template Properties</h2>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      label={'ID'}
                      component={TextField}
                      defaultValue={
                        dummyWF.id
                        //workflowTemplateQuery.data?.id ?? ''
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      label={'Name'}
                      component={TextField}
                      defaultValue={
                        dummyWF.name
                        // workflowTemplateQuery.data?.name ?? ''
                      }></Field>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      label={'Version'}
                      component={TextField}
                      defaultValue={
                        dummyWF.version
                        //workflowTemplateQuery.data
                        //  ? workflowTemplateQuery.data.version
                        //  : 1
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      label={'Classification ID'}
                      component={TextField}
                      defaultValue={
                        dummyWF.classificationId
                        //workflowTemplateQuery.data?.classificationId ?? ''
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      label={'Archived'}
                      component={TextField}
                      defaultValue={
                        dummyWF.archived
                        //workflowTemplateQuery.data?.archived ?? ''
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      label={'Date Created'}
                      component={TextField}
                      defaultValue={
                        dummyWF.dateCreated
                        //workflowTemplateQuery.data?.dateCreated ?? ''
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      label={'Last Edited'}
                      component={TextField}
                      defaultValue={
                        dummyWF.lastEdited
                        //workflowTemplateQuery.data?.lastEdited ?? ''
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      label={'Last Edited By'}
                      component={TextField}
                      defaultValue={
                        dummyWF.lastEditedBy
                        //workflowTemplateQuery.data?.lastEditedBy ?? ''
                      }
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <h2>Workflow Template Initial Conditions</h2>
                  </Grid>

                  <Grid item>
                    <Field
                      label={'Initial Conditions'}
                      component={TextField}
                      defaultValue={
                        dummyWF.initialConditions
                        //workflowTemplateQuery.data?.initialConditions ?? ''
                      }
                    />
                  </Grid>
                </Grid>

                <ViewTemplateSteps steps={dummyWF.steps} />
              </Paper>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};
