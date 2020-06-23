import '../index.css';

import PropTypes from 'prop-types';
import React from 'react';

interface IProps {
  posterImgSrc: string;
  posterImgUrl: string;
  videoUrl: string;
}
function ResourceTabPage(props: IProps): JSX.Element {
  return (
    <div>
      <img alt="education" className="education-img" src={props.posterImgSrc} />
      <p>
        <a href={props.posterImgUrl} rel="noopener noreferrer" target="_blank">
          Click to view/download PDF
        </a>
      </p>
      <div className="centered-flexbox marginTop">
        <iframe
          width="1080"
          height="730"
          src={props.videoUrl}
          title="Youtube video"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen></iframe>
      </div>
    </div>
  );
}

ResourceTabPage.propTypes = {
  posterImgSrc: PropTypes.string.isRequired,
  posterImgUrl: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
};

export default ResourceTabPage;
