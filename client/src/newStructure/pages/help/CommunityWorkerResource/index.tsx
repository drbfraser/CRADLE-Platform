import '../index.css';

import React from 'react';
import ResourceTabPage from '../ResourceTabPage';

// const COMMUNITY_WORKER_POSTER = 'images/education/community-poster.jpg';
const COMMUNITY_PDF_POSTER_LINK =
  'https://d1b10bmlvqabco.cloudfront.net/attach/k50h6wwq90s2ds/k076kzpukaj5rk/k5vlxvf31tmz/Community_Poster.pdf';
const COMMUNITY_WORKER_EDUCATION_VIDEO_LINK =
  'https://www.youtube.com/embed/WvS3L5P4P2c';

const COMMUNITY_WORKER_POSTER = [
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

function CommunityWorkerResources(): JSX.Element {
  return (
    <ResourceTabPage
      posterImgSrc={COMMUNITY_WORKER_POSTER}
      posterImgUrl={COMMUNITY_PDF_POSTER_LINK}
      videoUrl={COMMUNITY_WORKER_EDUCATION_VIDEO_LINK}
    />
  );
}
export { CommunityWorkerResources };
