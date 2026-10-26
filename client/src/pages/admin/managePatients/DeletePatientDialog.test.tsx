import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { mockServer } from 'src/testing/mockServer';
import ProviderWrapper from 'src/testing/ProviderWrapper';
import { API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { Patient } from 'src/shared/types/patientTypes';
import DeletePatientDialog from './DeletePatientDialog';

// API calls need an access token; this one never expires (same as the API tests).
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: () =>
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTksInVzZXJuYW1lIjoidGVzdHVzZXIifQ.test',
    setItem: () => {},
    removeItem: () => {},
  },
  writable: true,
});

const patient = { id: '49300028162', name: 'Test Patient' } as Patient;
const deleteUrl = API_URL + EndpointEnum.PATIENTS + '/' + patient.id;

const renderDialog = (onClose = vi.fn()) => {
  render(
    <ProviderWrapper>
      <DeletePatientDialog open={true} onClose={onClose} patient={patient} />
    </ProviderWrapper>
  );
  return onClose;
};

describe('DeletePatientDialog', () => {
  test('shows the patient name and ID in the warning', () => {
    renderDialog();

    expect(
      screen.getByText(`Delete Patient: ${patient.name}`)
    ).toBeInTheDocument();
    expect(screen.getByTestId('warningAlert')).toHaveTextContent(patient.id);
  });

  test('deletes the patient and closes when confirmed', async () => {
    const deleteRequest = vi.fn();
    mockServer.use(
      http.delete(deleteUrl, () => {
        deleteRequest();
        return new HttpResponse(null, { status: 200 });
      })
    );
    const onClose = renderDialog();

    await userEvent.click(screen.getByText('Yes'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(deleteRequest).toHaveBeenCalledTimes(1);
  });

  test('does not delete when cancelled', async () => {
    const deleteRequest = vi.fn();
    mockServer.use(
      http.delete(deleteUrl, () => {
        deleteRequest();
        return new HttpResponse(null, { status: 200 });
      })
    );
    const onClose = renderDialog();

    await userEvent.click(screen.getByText('No'));

    expect(onClose).toHaveBeenCalled();
    expect(deleteRequest).not.toHaveBeenCalled();
  });

  test('stays open and shows an error if the delete fails', async () => {
    mockServer.use(
      http.delete(deleteUrl, () =>
        HttpResponse.json({ description: 'Server error' }, { status: 500 })
      )
    );
    const onClose = renderDialog();

    await userEvent.click(screen.getByText('Yes'));

    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
