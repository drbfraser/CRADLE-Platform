import { BASE_URL, USERNAME, PASSWORD } from '../../playwright/constants';

describe('login spec', () => {
  it('Login', () => {
    cy.visit(BASE_URL);
    cy.contains('Log in');
    cy.get('input[name=username]').type(USERNAME);
    cy.get('input[name=password]').type(PASSWORD);

    cy.get('button').should('contain', 'Log in').click();
    // Check that we have been redirected to Referrals page.
    cy.url().should('contain', '/referrals');
  });
  it('No Password Login', () => {
    cy.visit(BASE_URL);
    cy.get('input[name=username]').type(USERNAME);
    cy.get('input[name=password]').type(PASSWORD);

    cy.get('button').should('contain', 'Log in').click();
    // Check that URL hasn't changed.
    cy.url().should('eq', BASE_URL);
  });
  it('No Email Login', () => {
    cy.visit(BASE_URL);
    cy.get('input[name=password]').type(PASSWORD);

    cy.get('button').should('contain', 'Log in').click();
    // Check that URL hasn't changed.
    cy.url().should('eq', BASE_URL);
  });
  it('No Credentials Login', () => {
    cy.visit(BASE_URL);

    cy.get('button').should('contain', 'Log in').click();
    // Check that URL hasn't changed.
    cy.url().should('eq', BASE_URL);
  });
});
