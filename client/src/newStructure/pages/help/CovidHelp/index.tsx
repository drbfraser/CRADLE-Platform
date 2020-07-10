import '../index.css';

import React from 'react';
import ResourceTabPage from '../ResourceTabPage';

// const COMMUNITY_WORKER_POSTER = 'images/education/community-poster.jpg';
const COMMUNITY_PDF_POSTER_LINK = '';
const COMMUNITY_WORKER_EDUCATION_VIDEO_LINK =
  'https://www.youtube.com/embed/-GncQ_ed-9w';
const COMMUNITY_WORKER_POSTER = [
  {
    label: 'Avoid Close Contact',
    imgPath: 'images/covid/avoid_close_contact.png',
  },
  {
    label: 'Protect Others From Getting Sick',
    imgPath: 'images/covid/protct_others_from.png',
  },
  {
    label: 'Wash Your Hands',
    imgPath: 'images/covid/wash_your_hands.png',
  },
  {
    label: 'Address Fear',
    imgPath: 'images/covid/address_fear.jpg',
  },
  {
    label: 'Always Be Kind',
    imgPath: 'images/covid/always_be_kind.jpg',
  },
  {
    label: 'Address Stigma',
    imgPath: 'images/covid/address_stigma.jpg',
  },
  {
    label: 'Always Stay Informed',
    imgPath: 'images/covid/always_stay_informed.jpg',
  },
  {
    label: 'Be Smart',
    imgPath: 'images/covid/be_smart.jpg',
  },
  {
    label: 'Stay Informed',
    imgPath: 'images/covid/stay_informed.jpg',
  },
  {
    label: 'Be Informed',
    imgPath: 'images/covid/be_informed.jpg',
  },
  {
    label: 'Be Supportive',
    imgPath: 'images/covid/be_supportive.jpg',
  },
  {
    label: 'Be Ready For Corona Virus',
    imgPath: 'images/covid/be_ready_for_covid.jpg',
  },
];
function CovidHelp(): JSX.Element {
  return (
    <ResourceTabPage
      posterImgSrc={COMMUNITY_WORKER_POSTER}
      posterImgUrl={COMMUNITY_PDF_POSTER_LINK}
      videoUrl={COMMUNITY_WORKER_EDUCATION_VIDEO_LINK}
    />
  );
}
export { CovidHelp };
