import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import Box from '@mui/material/Box/Box';
import Typography from '@mui/material/Typography/Typography';
import { ArrowDropDownIcon } from '@mui/x-date-pickers/icons';
import { formatDate } from 'src/shared/utils';
import ArticleIcon from '@mui/icons-material/Article';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface IProps {
  step: any; // should be a type
  isInstance?: boolean;
  handleMakeCurrent?: any;
}

export const WorkflowStep = ({
  step,
  isInstance,
  handleMakeCurrent,
}: IProps) => {
  const formName =
    step.form?.name ||
    step.form?.classification?.name ||
    step.form?.classification?.name?.english ||
    (step.formId ? `Form ID: ${step.formId}` : null);

  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Typography component="span">
            <Box component="b">Step {step.index}: </Box> {step.name}
            {step.formId && (
              <Tooltip title="This step has an associated form" placement="top">
                <span>
                  <IconButton component="span" size="small" disabled>
                    <ArticleIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {isInstance && (
              <Tooltip title="Set this as current step" placement="top">
                <IconButton
                  component="span"
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleMakeCurrent(step.id, step.name);
                  }}>
                  <PlayArrowIcon />
                </IconButton>
              </Tooltip>
            )}
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Typography>
            <Box component="b">Description: </Box> {step.description}
          </Typography>
          {formName && (
            <Typography>
              <Box component="b">Form: </Box> {formName}
            </Typography>
          )}
          {step.expectedCompletion && (
            <Typography>
              <Box component="b">Expected Completion Date:</Box>{' '}
              {formatDate(step.expectedCompletion)}
            </Typography>
          )}
          {step.conditions && (
            <Typography>
              <Box component="b">Conditions: </Box> {step.conditions.rule}
            </Typography>
          )}
          {step.branchIndices && step.branchIndices.length > 0 && (
            <Typography>
              <Box component="b">Next Step(s): </Box>{' '}
              {step.branchIndices.toString()}
            </Typography>
          )}
          <Typography>
            <Box component="b">Last Edited: </Box> {formatDate(step.lastEdited)}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
};
