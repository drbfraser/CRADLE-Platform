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
      'Drag a COMPARE block from Comparisons and Logic into the workspace, then drop a Variable or Value into each side to form a condition.',
      'To build more than one condition, combine them with AND/OR/NOT blocks.',
      'Conditions blocks have pointed edges and Values/Variables blocks have rounded edges, blocks are also color-coded, so you can see where each block fits.',
      'Fill every empty slot before saving or copying.',
      'Give the condition a name so it appears on the flow diagram.',
    ],
  },
  {
    title: 'Comparisons and Logic',
    body: [
      'AND / OR — combine multiple conditions (e.g. age > 18 AND is pregnant).',
      'NOT — flip a condition\u2019s result.',
      'COMPARE — compares two values. Numbers and dates can use =, ≠, <, >, ≤, ≥ (for dates: before, after, etc.). Text and true/false can only use = or ≠.',
      'CHECK TEXT — checks whether text contains, starts with or ends with something, with or without matching upper/lower case, or length (e.g. name length is greater than 5).',
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
      'For Variable blocks (e.g. Patient info): Pick any variable from its dropdown.',
      'The block changes colour and type to match the variable you pick. If it no longer fits where it is connected, it pops out.',
      'Patient info — fields from the patient record (age, sex, DOB, etc.) when available.',
      'Form Questions info — questions from the form on the step you are branching from.',
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
