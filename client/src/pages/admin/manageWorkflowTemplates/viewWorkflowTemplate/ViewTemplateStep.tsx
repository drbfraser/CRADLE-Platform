import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Box from '@mui/material/Box/Box';
import Typography from '@mui/material/Typography/Typography';
import { ArrowDropDownIcon } from '@mui/x-date-pickers/icons';
import { TemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowTypes';

interface IProps {
  step: TemplateStepWithFormAndIndex;
}

export const ViewTemplateStep = ({ step }: IProps) => {
  //console.log(step.form);

  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Typography component="span">
            <Box component="b">Step {step.index}:</Box> {step.title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {step.form ? (
            <>
              <Typography>
                <Box component="b">Form ID:</Box> {step.formId}
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
              {step.expectedCompletion}
            </Typography>
          ) : (
            <></>
          )}
        </AccordionDetails>
      </Accordion>
    </>
  );
};
