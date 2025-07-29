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
  TemplateStepWithFormAndIndex,
  WorkflowTemplate,
} from 'src/shared/types/workflow/workflowTypes';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTemplateSteps } from 'src/shared/api/modules/workflowTemplates';
import { ViewTemplateSteps } from './ViewTemplateSteps';

export enum WorkflowEditMainComponents {
  title = 'title',
  version = 'version',
}

export const initialState = {
  [WorkflowEditMainComponents.title]: '',
  [WorkflowEditMainComponents.version]: '1',
};

export const ViewWorkflowTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const viewWorkflow = location.state?.viewWorkflow as WorkflowTemplate;
  const [viewWorkflowSteps, setViewWorkflowSteps] = useState<
    TemplateStep[] | undefined
  >(undefined);

  const workflowTemplateStepsQuery = useQuery({
    queryKey: ['workflowTemplateSteps', viewWorkflow.id],
    queryFn: async (): Promise<TemplateStep[]> => {
      const result = await listTemplateSteps(viewWorkflow.id);
      return Array.isArray(result)
        ? result
        : (result as { items: TemplateStep[] }).items || [];
    },
  });

  useEffect(() => {
    setViewWorkflowSteps(workflowTemplateStepsQuery.data);
  }, [workflowTemplateStepsQuery.data]);

  const isLoading = workflowTemplateStepsQuery.isPending;

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
          View Workflow Template
        </Typography>
      </Box>

      <Formik
        initialValues={initialState}
        onSubmit={() => {
          console.log('Temp');
        }}>
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
                    defaultValue={viewWorkflow.id}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field
                    label={'Name'}
                    component={TextField}
                    defaultValue={viewWorkflow.name}></Field>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field
                    label={'Description'}
                    component={TextField}
                    defaultValue={viewWorkflow.description}></Field>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field
                    label={'Version'}
                    component={TextField}
                    defaultValue={viewWorkflow.version}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field
                    label={'Classification ID'}
                    component={TextField}
                    defaultValue={viewWorkflow.classificationId}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field
                    label={'Classification Name'}
                    component={TextField}
                    defaultValue={
                      viewWorkflow.classification
                        ? viewWorkflow.classification.name
                        : ''
                    }
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field
                    label={'Archived'}
                    component={TextField}
                    defaultValue={viewWorkflow.archived}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field
                    label={'Date Created'}
                    component={TextField}
                    defaultValue={viewWorkflow.dateCreated}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field
                    label={'Last Edited'}
                    component={TextField}
                    defaultValue={viewWorkflow.lastEdited}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field
                    label={'Last Edited By'}
                    component={TextField}
                    defaultValue={viewWorkflow.lastEditedBy}
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
                      viewWorkflow.initialConditions
                        ? viewWorkflow.initialConditions
                        : ''
                    }
                  />
                </Grid>
              </Grid>
            </Paper>
          </Form>
        )}
      </Formik>
      {isLoading ? (
        <Skeleton variant="rectangular" height={400} />
      ) : (
        <ViewTemplateSteps
          steps={viewWorkflowSteps as TemplateStepWithFormAndIndex[]} firstStep={viewWorkflow.startingStepId}
        />
      )}
    </>
  );
};
