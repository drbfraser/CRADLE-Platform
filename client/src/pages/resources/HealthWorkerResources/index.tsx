import '../index.css';

import ResourceTabPage from '../ResourceTabPage';

// const HEALTH_WORKER_POSTER = 'images/education/clinic-poster.jpg';
const CLINIC_PDF_POSTER_LINK =
  'https://d1b10bmlvqabco.cloudfront.net/attach/k50h6wwq90s2ds/k076kzpukaj5rk/k5vly8uz8c2a/Clinic_Poster.pdf';
const HEALTH_WORKER_EDUCATION_VIDEO =
  'https://www.youtube.com/embed/QainNBCHKAg';

const HEALTH_WORKER_POSTER = [
  {
    label: 'WHY',
    imgPath: 'images/education/why.png',
  },
  {
    label: 'HOW',
    imgPath: 'images/education/how.png',
  },
  {
    label: 'CRADLE VSA',
    imgPath: 'images/education/cradleVSA.png',
  },
  {
    label: 'YELLOW RESULT',
    imgPath: 'images/education/yellowHCW.png',
  },
  {
    label: 'RED RESULT',
    imgPath: 'images/education/redHCW.png',
  },
];
function HealthWorkerResources(): JSX.Element {
  return (
    <ResourceTabPage
      posterImgSrc={HEALTH_WORKER_POSTER}
      posterImgUrl={CLINIC_PDF_POSTER_LINK}
      videoUrl={HEALTH_WORKER_EDUCATION_VIDEO}
    />
  );
}
export { HealthWorkerResources };
