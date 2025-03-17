import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { API_URL } from 'src/shared/api/api';
import { EndpointEnum } from 'src/shared/enums';
import { FORM_TEMPLATE_TEST_DATA } from './testData';

const handlers = [
  http.get(API_URL + EndpointEnum.FORM_TEMPLATES, ({ request }) => {
    console.log('caught the request!!!');
    const url = new URL(request.url);
    const includeArchived = url.searchParams.get('include_archived');

    const formTemplates =
      includeArchived === 'true'
        ? FORM_TEMPLATE_TEST_DATA.archivedTemplates
        : FORM_TEMPLATE_TEST_DATA.unArchivedTemplates;
    return HttpResponse.json(formTemplates, { status: 200 });
  }),
];

export const mockServer = setupServer(...handlers);
