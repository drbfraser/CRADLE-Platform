import { ADMIN_CREDENTIALS } from '../../playwright/constants';

describe('login spec', () => {
  it('Login', () => {
    cy.visit('/');
    cy.contains('Login');
    cy.get('input[name=username]').type(ADMIN_CREDENTIALS.username);
    cy.get('input[name=password]').type(ADMIN_CREDENTIALS.password);

    cy.get('button').should('contain', 'Login').click();

    cy.url().should('contain', '/referrals');
  });
  it('No Password Login', () => {
    cy.visit('/');
    cy.get('input[name=username]').type(ADMIN_CREDENTIALS.username);

    cy.get('button').contains('Login').should('be.disabled');
  });
  it('No Email Login', () => {
    cy.visit('/');
    cy.get('input[name=password]').type(ADMIN_CREDENTIALS.password);

    cy.get('button').contains('Login').should('be.disabled');
  });
  it('No Credentials Login', () => {
    cy.visit('/');

    cy.get('button').contains('Login').should('be.disabled');
  });
});
