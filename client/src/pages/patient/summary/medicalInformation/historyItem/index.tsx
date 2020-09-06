import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { OrNull } from '@types';
import React from 'react';
import Typography from '@material-ui/core/Typography';

interface IProps {
  title: string;
  history: OrNull<string>;
}

export const HistoryItem: React.FC<IProps> = ({ title, history }) => {
  return history ? (
    <Accordion>
      <AccordionSummary
        expandIcon={<KeyboardArrowDownIcon />}
        aria-controls={`${title}-content`}
        id={`${title}-header`}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>{history}</Typography>
      </AccordionDetails>
    </Accordion>
  ) : null;
};
