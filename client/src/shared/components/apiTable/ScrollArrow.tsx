import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import VerticalAlignTopIcon from '@material-ui/icons/VerticalAlignTop';

const ScrollArrow = () => {
  const classes = useStyles();

  const [isBigOffset, setIsBigOffset] = useState(false)

  const checkPageOffset = () => {
    if (!isBigOffset && window.pageYOffset > 400){
      setIsBigOffset(true)
    } else if (isBigOffset && window.pageYOffset <= 400){
      setIsBigOffset(false)
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.addEventListener('scroll', checkPageOffset)

  return (
    <IconButton
      className={classes.iconButton}
      onClick={scrollToTop}
      style={{ display: isBigOffset ? 'flex' : 'none' }}
    >
      <VerticalAlignTopIcon />
    </IconButton>
  );
}

export default ScrollArrow;

const useStyles = makeStyles((theme) => ({
  iconButton: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    opacity: '0.5',
    '&:hover': {
      opacity: '1',
    },
  },
}));