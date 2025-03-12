import { test as teardown, TEST_PATIENT_NAME, TestPatient } from './fixtures';

/** This will run after all other tests have finished. */
teardown.describe('Cleanup', () => {
  /** All other entities that were created for any of the test patients
   * should automatically get deleted when the test patient is deleted,
   * assuming that they were setup correctly in the database.
   */
  teardown('Cleanup Test Patients', async ({ api }) => {
    const response = await api.get('/api/patients/admin', {
      params: {
        limit: 10000,
      },
    });
    const testPatients = (<TestPatient[]>await response.json()).filter(
      ({ name }) => name.includes(TEST_PATIENT_NAME)
    );
    testPatients.forEach(async ({ id }) => {
      await api.delete(`/api/patients/${id}`);
    });
  });
});
