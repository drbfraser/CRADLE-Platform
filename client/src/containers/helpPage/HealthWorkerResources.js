import React from 'react'
import "./helpPage.css"
import HEALTH_FACILITY_WORKER_EDUCATION_VIDEO_LINK from './index';

const CLINIC_PDF_POSTER_LINK = "https://d1b10bmlvqabco.cloudfront.net/attach/k50h6wwq90s2ds/k076kzpukaj5rk/k5vly8uz8c2a/Clinic_Poster.pdf"

export default function HealthWorkerResources() {
    return (
        <div>
            <img className="education-img" src="images/education/clinic-poster.jpg" />
            <p><a href={CLINIC_PDF_POSTER_LINK} target="_blank">Click to view/download PDF</a></p>
            <div className="centered-flexbox marginTop">
                <iframe width="1080" height="730" src="https://www.youtube.com/embed/QainNBCHKAg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>
    )
}
