import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';
import { QuestionTypeEnum } from 'src/shared/enums';

type FormQuestionRowActionsProps = {
  question: TQuestion;
  onMoveUp: (question: TQuestion) => void;
  onMoveDown: (question: TQuestion) => void;
  onEdit: (question: TQuestion) => void;
  onDelete: (question: TQuestion) => void;
};

export const FormQuestionRowActions = ({
  question,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: FormQuestionRowActionsProps) => (
  <Grid container item xs={2} sm={1} xl={0.5} style={{ marginLeft: '-20px' }}>
    <Grid item xs={6}>
      <IconButton
        key={`field-up-${question.order}`}
        size="small"
        onClick={() => onMoveUp(question)}>
        <KeyboardArrowUpIcon fontSize="small" />
      </IconButton>
    </Grid>
    <Grid item xs={6}>
      <IconButton
        sx={{ marginLeft: '10px' }}
        key={`edit-field-${question.order}`}
        size="small"
        onClick={() => onEdit(question)}>
        <EditIcon fontSize="small" />
      </IconButton>
    </Grid>
    <Grid item xs={6}>
      <IconButton
        key={`field-down-${question.order}`}
        size="small"
        onClick={() => onMoveDown(question)}>
        <KeyboardArrowDownIcon fontSize="small" />
      </IconButton>
    </Grid>
    <Grid item xs={6}>
      <IconButton
        sx={{ marginLeft: '10px' }}
        key={`delete-field-${question.order}`}
        size="small"
        color="error"
        onClick={() => onDelete(question)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Grid>
  </Grid>
);

export const moveQuestionUp = (
  question: TQuestion,
  handlers: {
    handleCatUp: (q: TQuestion) => void;
    handleFieldUp: (q: TQuestion) => void;
  }
) => {
  if (question.questionType === QuestionTypeEnum.CATEGORY) {
    handlers.handleCatUp(question);
  } else {
    handlers.handleFieldUp(question);
  }
};

export const moveQuestionDown = (
  question: TQuestion,
  handlers: {
    handleCatDown: (q: TQuestion) => void;
    handleFieldDown: (q: TQuestion) => void;
  }
) => {
  if (question.questionType === QuestionTypeEnum.CATEGORY) {
    handlers.handleCatDown(question);
  } else {
    handlers.handleFieldDown(question);
  }
};
