import '../index.css';

import { PrimaryButton, SecondaryButton } from 'src/shared/components/Button';

import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';

interface IProps {
  posterImgSrc: any[];
  posterImgUrl: string;
  videoUrl: string;
}

function ResourceTabPage(props: IProps): JSX.Element {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = props.posterImgSrc.length;
  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Box
          className="margin"
          style={{ width: isBigScreen ? '640px' : '340px' }}>
          <Paper
            square
            elevation={0}
            sx={(theme) => ({
              textAlign: 'center',
              paddingLeft: theme.spacing(4),
              backgroundColor: '#15152B',
              color: '#F2F2F2',
            })}
            style={{ width: isBigScreen ? '640px' : '340px' }}>
            <Typography>{props.posterImgSrc[activeStep].label}</Typography>
          </Paper>
          <Box
            component={'img'}
            alt="Resources"
            sx={{
              height: '480px',
              maxWidth: '640px',
              overflow: 'hidden',
              display: 'block',
              width: '100%',
              objectFit: 'contain',
              backgroundColor: 'aliceblue',
            }}
            src={props.posterImgSrc[activeStep].imgPath}
          />

          <MobileStepper
            style={{ width: isBigScreen ? '640px' : '340px' }}
            variant="progress"
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            sx={{
              maxWidth: '100%',
              flexGrow: 1,
            }}
            nextButton={
              <PrimaryButton
                disabled={activeStep === maxSteps - 1}
                onClick={handleNext}>
                Next
              </PrimaryButton>
            }
            backButton={
              <SecondaryButton disabled={activeStep === 0} onClick={handleBack}>
                Back
              </SecondaryButton>
            }
          />
          {/* <img alt="education" className="education-img" src={props.posterImgSrc} /> */}
          <p>
            <a
              href={props.posterImgUrl}
              rel="noopener noreferrer"
              target="_blank">
              Click to view/download PDF
            </a>
          </p>
        </Box>
      </Box>
      <Box
        className="centered-flexbox margin"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <iframe
          width={isBigScreen ? '640' : '340'}
          height="480"
          src={props.videoUrl}
          title="Youtube video"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen></iframe>
      </Box>
    </>
  );
}

ResourceTabPage.propTypes = {
  posterImgSrc: PropTypes.array.isRequired,
  posterImgUrl: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
};

export default ResourceTabPage;
