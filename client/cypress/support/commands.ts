/// <reference types="cypress" />

import { ADMIN_CREDENTIALS } from '../../playwright/constants';

const API_URL = 'http://127.0.0.1:5000/api';
const { username, password } = ADMIN_CREDENTIALS;

Cypress.Commands.add('login', () => {
  cy.visit('localhost:3000/');
  cy.get('input[name=username]').type(username);
  cy.get('input[name=password]').type(password);
  cy.get('button').contains('Login').click();
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'accessToken')
    .should('exist');
});

Cypress.Commands.add('createTestPatient', () => {
  return cy
    .window()
    .its('localStorage')
    .invoke('getItem', 'accessToken')
    .should('exist')
    .then((token) => {
      return cy.request({
        method: 'POST',
        url: `${API_URL}/patients`,
        headers: { Authorization: `bearer ${token}` },
        body: {
          name: `cy-e2e-patient-${Date.now()}`,
          sex: 'MALE',
          dateOfBirth: '2000-01-01',
          isExactDateOfBirth: true,
        },
      });
    });
});

Cypress.Commands.add('createTestFormTemplate', (name: string) => {
  return cy
    .window()
    .its('localStorage')
    .invoke('getItem', 'accessToken')
    .should('exist')
    .then((token) => {
      return cy.request({
        method: 'POST',
        url: `${API_URL}/forms/v2/templates/body`,
        headers: { Authorization: `bearer ${token}` },
        body: {
          classification: { name: { english: name } },
          version: Date.now() % 100000,
          questions: [
            {
              questionType: 'STRING',
              required: true,
              order: 0,
              questionText: { english: 'Patient notes' },
              mcOptions: [],
              visibleCondition: [],
              isBlank: true,
            },
          ],
        },
      });
    });
});

Cypress.Commands.add(
  'selectAndFetchFormTemplate',
  (templateName: string) => {
    cy.contains('.MuiAutocomplete-root', 'Form').find('input').click().clear();
    cy.contains('.MuiAutocomplete-root', 'Form')
      .find('input')
      .type(templateName);
    cy.contains('[role="option"]', templateName).click();
    cy.contains('button', 'Fetch Form').click();
    cy.contains('Patient notes', { timeout: 15000 }).should('be.visible');
  }
);

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      createTestPatient(): Chainable<Cypress.Response<any>>;
      createTestFormTemplate(name: string): Chainable<Cypress.Response<any>>;
      selectAndFetchFormTemplate(templateName: string): Chainable<void>;
    }
  }
}

export {};
