import '../index.css';

import { PrimaryButton, SecondaryButton } from 'src/shared/components/Button';

import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { BIG_SCREEN_MEDIA_QUERY } from 'src/shared/constants';

interface IProps {
  posterImgSrc: any[];
  posterImgUrl: string;
  videoUrl: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    center: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    root: {
      maxWidth: '100%',
      flexGrow: 1,
    },
    header: {
      textAlign: 'center',
      paddingLeft: theme.spacing(4),
      backgroundColor: '#15152B',
      color: '#F2F2F2',
    },
    img: {
      height: 480,
      maxWidth: 640,
      overflow: 'hidden',
      display: 'block',
      width: '100%',
      objectFit: 'contain',
      backgroundColor: 'aliceblue',
    },
  })
);
function ResourceTabPage(props: IProps): JSX.Element {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = props.posterImgSrc.length;
  const isBigScreen = useMediaQuery(BIG_SCREEN_MEDIA_QUERY);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <>
      <div className={classes.center}>
        <div
          className="margin"
          style={{ width: isBigScreen ? '640px' : '340px' }}>
          <Paper
            square
            elevation={0}
            className={classes.header}
            style={{ width: isBigScreen ? '640px' : '340px' }}>
            <Typography>{props.posterImgSrc[activeStep].label}</Typography>
          </Paper>
          <img
            alt="Resources"
            className={classes.img}
            src={props.posterImgSrc[activeStep].imgPath}
          />

          <MobileStepper
            style={{ width: isBigScreen ? '640px' : '340px' }}
            variant="progress"
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            className={classes.root}
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
        </div>
      </div>
      <div className="centered-flexbox margin">
        <iframe
          width={isBigScreen ? '640' : '340'}
          height="480"
          src={props.videoUrl}
          title="Youtube video"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen></iframe>
      </div>
    </>
  );
}

ResourceTabPage.propTypes = {
  posterImgSrc: PropTypes.array.isRequired,
  posterImgUrl: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
};

export default ResourceTabPage;
