import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { FORM_TEMPLATE_TEST_DATA } from './testData';

const handlers = [
  http.get(API_URL + EndpointEnum.FORM_TEMPLATES, ({ request }) => {
    const url = new URL(request.url);
    const includeArchived = url.searchParams.get('include_archived');

    const formTemplates =
      includeArchived === 'true'
        ? FORM_TEMPLATE_TEST_DATA.archivedTemplates
        : FORM_TEMPLATE_TEST_DATA.unArchivedTemplates;
    return HttpResponse.json(formTemplates, { status: 200 });
  }),
  // Default form submission endpoints — individual tests override as needed.
  http.post(API_URL + '/forms/v2/submissions', () =>
    HttpResponse.json({ id: 'submission-default' }, { status: 201 })
  ),
  http.get(API_URL + '/forms/v2/submissions/:formId', ({ params }) =>
    HttpResponse.json(
      {
        id: params.formId,
        formTemplateId: 'template-default',
        patientId: 'patient-default',
        dateSubmitted: 0,
        lastEdited: 0,
        lang: 'English',
        answers: [],
      },
      { status: 200 }
    )
  ),
  http.patch(API_URL + '/forms/v2/submissions/:formId', ({ params }) =>
    HttpResponse.json({ id: params.formId }, { status: 200 })
  ),
];

export const mockServer = setupServer(...handlers);
