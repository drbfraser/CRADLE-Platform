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
      'Drag one compare block into the workspace — that is the main condition for this branch.',
      'Connect variables or values to every empty slot before saving.',
      'Give the condition a name so it appears on the flow diagram.',
    ],
  },
  {
    title: 'Number Compare',
    body: [
      'Use for ages, counts, or any numeric rule (e.g. patient age > 18).',
      'Drag a Number variable into the left slot, then pick an operator and enter a number on the right.',
    ],
  },
  {
    title: 'Text Compare',
    body: [
      'Open Text Compare in the toolbox, then pick a sub-category:',
      'Comparison — equals, contains, starts with, etc. for text answers or fields.',
      'Operations — contains, starts with, ends with, or length (e.g. name length > 5).',
      'Use Form Questions variables for answers from this step’s form.',
    ],
  },
  {
    title: 'Date Compare',
    body: [
      'Compare dates such as date of birth before or after a given day.',
      'Use a Date variable on the left and a date value on the right.',
    ],
  },
  {
    title: 'Logic Compare',
    body: [
      'Open Logic Compare in the toolbox, then pick a sub-category:',
      'True/False — test yes/no or boolean fields (e.g. is pregnant).',
      'Logic — AND / OR to combine two conditions, or NOT to flip a result.',
    ],
  },
  {
    title: 'Variables',
    body: [
      'Patient — profile fields from the patient record (age, sex, DOB, etc.) when available.',
      'Form Questions — questions from the form on the step you are branching from.',
      'Values — type a literal number, text, date, or true/false when you do not need a variable.',
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
        Each branch needs one top-level rule. When it evaluates to true, the
        workflow follows this branch to the next step.
      </Typography>
      {SECTIONS.map((section, index) => (
        <React.Fragment key={section.title}>
          {index > 0 && <Divider sx={{ my: 1.5 }} />}
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
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
