import IconButton from '@mui/material/IconButton';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import { useState } from 'react';

const ScrollArrow = () => {
  const [isBigOffset, setIsBigOffset] = useState(false);

  const checkPageOffset = () => {
    if (!isBigOffset && window.pageYOffset > 400) {
      setIsBigOffset(true);
    } else if (isBigOffset && window.pageYOffset <= 400) {
      setIsBigOffset(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.addEventListener('scroll', checkPageOffset);

  return (
    <IconButton
      sx={(theme) => ({
        iconButton: {
          position: 'fixed',
          bottom: theme.spacing(2),
          right: theme.spacing(2),
          opacity: '0.5',
          '&:hover': {
            opacity: '1',
          },
        },
      })}
      onClick={scrollToTop}
      style={{ display: isBigOffset ? 'flex' : 'none' }}
      size="large">
      <VerticalAlignTopIcon />
    </IconButton>
  );
};

export default ScrollArrow;
