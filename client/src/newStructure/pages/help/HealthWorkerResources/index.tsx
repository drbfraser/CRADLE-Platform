import '../index.css';

import React from 'react';
import ResourceTabPage from '../ResourceTabPage';

const HEALTH_WORKER_POSTER = 'images/education/clinic-poster.jpg';
const CLINIC_PDF_POSTER_LINK =
  'https://d1b10bmlvqabco.cloudfront.net/attach/k50h6wwq90s2ds/k076kzpukaj5rk/k5vly8uz8c2a/Clinic_Poster.pdf';
const HEALTH_WORKER_EDUCATION_VIDEO =
  'https://www.youtube.com/embed/QainNBCHKAg';

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
