import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Box from '@mui/material/Box/Box';
import Typography from '@mui/material/Typography/Typography';
import { ArrowDropDownIcon } from '@mui/x-date-pickers/icons';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getUserAsync } from 'src/shared/api';
import { TemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowTypes';
import { formatDate } from 'src/shared/utils';

interface IProps {
  step: TemplateStepWithFormAndIndex;
}

export const ViewTemplateStep = ({ step }: IProps) => {
  //console.log(step);

  const editorQuery = useQuery({
    queryKey: ['user', step.lastEditedBy],
    queryFn: async () => {
      const result = await getUserAsync(step.lastEditedBy);
      return result;
    },
  });

  const [editor, setEditor] = useState<string>('unknown');

  useEffect(() => {
    if (editorQuery.data) {
      setEditor(editorQuery.data.name);
    }
  }, [editorQuery.data]);

  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Typography component="span">
            <Box component="b">Step {step.index}:</Box> {step.title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            <Box component="b">Name:</Box> {step.name}
          </Typography>
          {step.form ? (
            <>
              <Typography>
                <Box component="b">Form ID: </Box> {step.formId}
              </Typography>
              <Typography>
                <Box component="b">Form Classification:</Box>{' '}
                {step.form.classification.name}
              </Typography>
            </>
          ) : (
            <></>
          )}
          {step.expectedCompletion ? (
            <Typography>
              <Box component="b">Expected Completion Date:</Box>{' '}
              {formatDate(step.expectedCompletion)}
            </Typography>
          ) : (
            <></>
          )}
          {step.conditions ? (
            <Typography>
              <Box component="b">Conditions: </Box>{' '}
              {step.conditions.data_sources}
            </Typography>
          ) : (
            <></>
          )}
          {step.branchIndices && step.branchIndices.length > 0 ? (
            <Typography>
              <Box component="b">Next Step(s): </Box>{' '}
              {step.branchIndices.toString()}
            </Typography>
          ) : (
            <></>
          )}
          <Typography>
            <Box component="b">Last Edited </Box> {formatDate(step.lastEdited)}{' '}
            <Box component="b"> by </Box> {editor}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
};
