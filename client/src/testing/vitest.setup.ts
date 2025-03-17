import { afterAll, beforeAll, beforeEach } from 'vitest';
import { mockServer } from './mockServer';

beforeAll(() => {
  mockServer.listen();
});

beforeEach(() => {
  mockServer.resetHandlers();
});

afterAll(() => {
  mockServer.close();
});
