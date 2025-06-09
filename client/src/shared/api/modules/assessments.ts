//move Assessments apis to here 
import { axiosFetch } from "../core/http";
import { EndpointEnum } from 'src/shared/enums'
import {
  NewAssessment
} from '../../types'

export const saveAssessmentAsync = async (
  assessment: NewAssessment,
  assessmentId: string | undefined,
  patientId: string
) => {
  return axiosFetch({
    url:
      assessmentId !== undefined
        ? `${EndpointEnum.ASSESSMENTS}/${assessmentId}`
        : EndpointEnum.ASSESSMENTS,
    method: assessmentId !== undefined ? 'PUT' : 'POST',
    data: {
      patientId,
      ...assessment,
    },
  });
};

export const getAssessmentAsync = async (assessmentId: string) => {
  const resp = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.ASSESSMENTS + '/' + assessmentId,
  });
  return resp.data;
};