import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

interface RuleEditorHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    title: 'Getting started',
    body: [
      'Drag blocks from Check a Condition into the workspace — you can drop several at once.',
      'Connect them with AND/OR/NOT from Combine Conditions to build one combined condition.',
      'Connect variables or values to every empty slot before saving or copying.',
      'Give the condition a name so it appears on the flow diagram.',
    ],
  },
  {
    title: 'Check a Condition',
    body: [
      'Ask a yes/no question about a value — pick the block for what you want to know.',
      'Compare numbers: is equal to, is greater than, etc. (e.g. age is greater than 18).',
      'Compare dates: is before, is after, etc. (e.g. date of birth is before a given day).',
      'Check yes/no fields: is equal to (e.g. is pregnant).',
      'Check text: is equal to,contains, starts with, ends with, or length (e.g. name length is greater than 5).',
      'Blocks are colour-coded and shaped by type, so you can spot the right one at a glance.',
    ],
  },
  {
    title: 'Combine Conditions',
    body: [
      'Use once you already have two or more condition expressions (blocks) from Check a Condition.',
      'AND / OR — combine conditions (e.g. age > 18 AND is pregnant).',
      'NOT — flip a condition\u2019s result.',
      'Drag an AND/OR block and plug your condition blocks into both sides to link them.',
    ],
  },
  {
    title: 'Values',
    body: [
      'Type a literal number, text, date, or true/false when you do not need a variable.',
    ],
  },
  {
    title: 'Variables',
    body: [
      'Patient — profile fields from the patient record (age, sex, DOB, etc.) when available.',
      'Form Questions — questions from the form on the step you are branching from.',
    ],
  },
];

export const RuleEditorHelpDialog: React.FC<RuleEditorHelpDialogProps> = ({
  open,
  onClose,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>How to build branch conditions</DialogTitle>
    <DialogContent dividers>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Each branch needs one combined rule. When it evaluates to true, the
        workflow follows this branch to the next step.
      </Typography>
      {SECTIONS.map((section, index) => (
        <React.Fragment key={section.title}>
          {index > 0 && <Divider sx={{ my: 1.5 }} />}
          <Typography
            variant="subtitle2"
            sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary' }}>
            {section.title}
          </Typography>
          <List dense disablePadding>
            {section.body.map((line) => (
              <ListItem key={line} disablePadding sx={{ py: 0.25 }}>
                <ListItemText
                  primary={line}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </React.Fragment>
      ))}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained">
        Got it
      </Button>
    </DialogActions>
  </Dialog>
);
