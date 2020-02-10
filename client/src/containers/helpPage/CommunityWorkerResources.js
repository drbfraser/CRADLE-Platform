import React from 'react'
import "./helpPage.css"

const COMMUNITY_WORKER_EDUCATION_VIDEO_LINK = "https://www.youtube.com/embed/WvS3L5P4P2c"
const COMMUNITY_PDF_POSTER_LINK = "https://d1b10bmlvqabco.cloudfront.net/attach/k50h6wwq90s2ds/k076kzpukaj5rk/k5vlxvf31tmz/Community_Poster.pdf"

export default function CommunityWorkerResources() {
    return (
        <div>
            <img className="education-img" src="images/education/community-poster.jpg" />
            <p><a href={COMMUNITY_PDF_POSTER_LINK} target="_blank">Click to view/download PDF</a></p>
            <div className="centered-flexbox margin-top">
                <iframe width="1080" height="730" src={COMMUNITY_WORKER_EDUCATION_VIDEO_LINK} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>
    )
}
