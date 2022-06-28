import '../index.css';

import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';

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
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = props.posterImgSrc.length;
  const isBigScreen = useMediaQuery('(min-width:800px)');

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
              <Button
                color="primary"
                variant="contained"
                size="large"
                onClick={handleNext}
                disabled={activeStep === maxSteps - 1}>
                Next
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}>
                Back
              </Button>
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
