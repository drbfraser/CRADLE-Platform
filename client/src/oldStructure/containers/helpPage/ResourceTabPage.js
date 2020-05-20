import React from 'react'
import PropTypes from 'prop-types'
import "./helpPage.css"

function ResourceTabPage(props) {
    return (
        <div>
            <img className="education-img" src={props.posterImgSrc} />
            <p><a href={props.posterImgUrl} target="_blank">Click to view/download PDF</a></p>
            <div className="centered-flexbox marginTop">
                <iframe width="1080" height="730" src={props.videoUrl} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>
    )
}

ResourceTabPage.propTypes = {
    posterImgSrc: PropTypes.string.isRequired,
    posterImgUrl: PropTypes.string.isRequired,
    videoUrl: PropTypes.string.isRequired
}

export default ResourceTabPage
